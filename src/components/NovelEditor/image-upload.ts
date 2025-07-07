
import { EditorView } from "@tiptap/pm/view";
import { toast } from "sonner";

export const uploadFn = async (file: File, view: EditorView, pos: number) => {
  // Check file size (limit to 5MB for example)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    toast.error("File size too large. Please upload a file smaller than 5MB.");
    return;
  }

  // Check file type
  if (!file.type.startsWith("image/")) {
    toast.error("Please upload an image file.");
    return;
  }

  try {
    // For now, we'll create a simple file reader to show the image
    // In a real implementation, you'd upload to Supabase storage
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      if (result) {
        const transaction = view.state.tr;
        const node = view.state.schema.nodes.image.create({
          src: result,
          alt: file.name,
          title: file.name,
        });
        
        transaction.insert(pos, node);
        view.dispatch(transaction);
        
        toast.success("Image uploaded successfully!");
      }
    };
    
    reader.onerror = () => {
      toast.error("Failed to read the image file.");
    };
    
    reader.readAsDataURL(file);
  } catch (error) {
    console.error("Upload error:", error);
    toast.error("Failed to upload image. Please try again.");
  }
};

// For future enhancement with Supabase storage:
/*
export const uploadToSupabase = async (file: File): Promise<string> => {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `images/${fileName}`;

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath);

  return publicUrl;
};
*/
