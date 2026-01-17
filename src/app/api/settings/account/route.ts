import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteUserAccount } from "@/lib/services/deleteUserAccount";

export async function DELETE(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await deleteUserAccount(session.user.id);

    return NextResponse.json({
      message: "Account permanently deleted",
    });
  } catch (err) {
    console.error("ACCOUNT_DELETE_ERROR", err);
    return NextResponse.json(
      { error: "Account deletion failed" },
      { status: 500 }
    );
  }
}
