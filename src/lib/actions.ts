'use server';

import { z } from 'zod';
import { addShift, deleteShift, canPublishShift } from './data';
import { revalidatePath } from 'next/cache';

const FormSchema = z.object({
  name: z.string().min(2, { message: 'El nombre es requerido.' }),
  location: z.enum(['C.S. Granadilla', 'SNU San Isidro'], {
    required_error: 'Debes seleccionar un lugar.',
  }),
  time: z.enum(['20h a 8h', '8h a 20h', '9h a 17h', '17h a 9h'], {
    required_error: 'Debes seleccionar un horario.',
  }),
  phone: z.string().regex(/^[6-9]\d{8}$/, { message: 'Número de teléfono español no válido.' }),
  notes: z.string().max(200).optional(),
  date: z.string(),
  userId: z.string(),
});

const AddShiftSchema = FormSchema;

export async function addShiftAction(data: z.infer<typeof AddShiftSchema>) {
  const validatedFields = AddShiftSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: 'Error de validación. Por favor, revisa los campos.',
    };
  }
  
  const { date } = validatedFields.data;

  const canPublish = await canPublishShift(date);
  if (!canPublish) {
    return {
      error: 'Ya hay 2 guardias publicadas para este día. No se puede publicar más.',
    };
  }
  
  try {
    await addShift(validatedFields.data);
    revalidatePath('/');
    return { message: 'Guardia publicada correctamente.' };
  } catch (error) {
    return { error: 'Error del servidor al publicar la guardia.' };
  }
}

export async function deleteShiftAction(
  prevState: { message: string, error?: string }, 
  formData: FormData
): Promise<{ message: string, error?: string }> {
  const shiftId = formData.get('shiftId') as string;
  if (!shiftId) {
    return { message: '', error: 'Error: ID de guardia no encontrado.' };
  }
  
  try {
    await deleteShift(shiftId);
    revalidatePath('/');
    return { message: 'La guardia ha sido marcada como cambiada y eliminada.' };
  } catch (e) {
    return { message: '', error: 'Error al eliminar la guardia.' };
  }
}