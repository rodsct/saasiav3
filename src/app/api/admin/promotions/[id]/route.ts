import { NextRequest, NextResponse } from "next/server";
import { updatePromotion, deleteCustomPromotion } from "@/utils/envPromotions";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  
  // Simple auth check using headers (same pattern as other admin endpoints)
  const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updates = await request.json();
    const promotionId = params.id;

    console.log("Updating promotion:", promotionId, "with:", updates);

    const success = updatePromotion(promotionId, updates);
    
    if (!success) {
      return NextResponse.json(
        { error: "Promoción no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Promoción actualizada correctamente" });

  } catch (error) {
    console.error("Update promotion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  
  // Simple auth check using headers (same pattern as other admin endpoints)
  const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const promotionId = params.id;

    console.log("Deleting promotion:", promotionId);

    const success = deleteCustomPromotion(promotionId);
    
    if (!success) {
      return NextResponse.json(
        { error: "Promoción no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Promoción eliminada correctamente" });

  } catch (error) {
    console.error("Delete promotion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}