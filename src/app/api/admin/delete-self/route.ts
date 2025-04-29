import { createClient } from "@supabase/supabase-js";
import { NextResponse, NextRequest } from 'next/server';


const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

async function deleteSupabaseUser(userId: string) {

  if (!userId || typeof userId !== 'string' || userId.length < 36) {
      console.error('Invalid userId format provided for deletion:', userId);
      throw new Error('Invalid user ID format.');
  }
  console.log(`Attempting to delete user with ID: ${userId}`);
  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error(`Error deleting Supabase auth user ${userId}:`, error.message);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
  console.log(`Successfully deleted user ${userId} from Supabase auth.`);
  return data;
}


export async function DELETE(request: NextRequest) {
  console.log("DELETE /api/admin/delete-self called");

  try {
   
    const userCookie = request.cookies.get("userData");

    if (!userCookie || !userCookie.value) {
      console.warn("userData cookie not found in request.");
      return NextResponse.json({ message: 'Unauthorized: Missing user data cookie.' }, { status: 401 });
    }

   

    let parsedUserData;
    try {
      parsedUserData = JSON.parse(decodeURIComponent(userCookie.value));
     
    } catch (e) {
      console.error("Failed to parse userData cookie:", e);
      return NextResponse.json({ message: 'Bad Request: Invalid user data cookie format.' }, { status: 400 });
    }

    
    const userIdToDelete = parsedUserData?.id;

    if (!userIdToDelete) {
      console.error("Could not find user ID in parsed userData cookie:", parsedUserData);
      return NextResponse.json({ message: 'Bad Request: User ID not found in cookie.' }, { status: 400 });
    }

    
    if (parsedUserData?.role !== 'admin') {
        console.warn(`Attempt to delete non-admin user (${userIdToDelete}) with role: ${parsedUserData?.role}`);
        
    }

   
    console.log(`Attempting to delete user data from 'users' table for ID: ${userIdToDelete}`);
    const { error: profileDeleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userIdToDelete);

    if (profileDeleteError) {
      console.error('Error deleting user data from users table (continuing with auth deletion):', profileDeleteError);
    } else {
      console.log(`Successfully deleted user data from 'users' table for ID: ${userIdToDelete}`);
    }

    await deleteSupabaseUser(userIdToDelete);

    const response = NextResponse.json({ message: 'Admin account and related data deleted successfully' }, { status: 200 });
    response.cookies.set('userData', '', { maxAge: -1, path: '/' });
    return response;

  } catch (error: any) {
    console.error("Error in DELETE /api/admin/delete-self:", error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}