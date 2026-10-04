import { AdminTitle } from "@/components/admin/table";
import { Card } from "@/components/ui/card";
import { PostEditor } from "@/components/admin/post-editor";

export default function NewPostPage() {
  return (
    <>
      <AdminTitle title="New post" />
      <Card className="p-5 sm:p-6">
        <PostEditor />
      </Card>
    </>
  );
}
