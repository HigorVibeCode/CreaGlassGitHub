import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { username, email, password, userType } = await req.json();

    // Validate required fields
    if (!username || !email || !password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: username, email, and password are required' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUsers) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'User already exists',
          userId: existingUsers.id 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Check if auth user exists
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = authUsers?.users?.find(u => u.email === email);

    let userId: string;

    if (existingAuthUser) {
      userId = existingAuthUser.id;
    } else {
      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
      });

      if (authError || !authData.user) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: authError?.message || 'Failed to create auth user' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      userId = authData.user.id;
    }

    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        username: username,
        user_type: userType || 'Viewer', // Default to Viewer if not specified
        is_active: true,
      });

    if (profileError) {
      // If profile creation fails but auth user was just created, clean up
      if (!existingAuthUser) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: profileError.message || 'Failed to create user profile' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User created successfully',
        userId: userId,
        username: username,
        email: email
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
