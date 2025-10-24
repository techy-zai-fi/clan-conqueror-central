import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Edit, Plus, Upload } from "lucide-react";

interface Panch {
  id: string;
  clan_id: string;
  name: string;
  title: string;
  image_url: string | null;
  display_order: number;
  user_id: string | null;
}

interface User {
  id: string;
  email: string;
}

interface Clan {
  id: string;
  name: string;
}

export default function AdminClanPanchs() {
  const [panchs, setPanchs] = useState<Panch[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingPanch, setEditingPanch] = useState<Panch | null>(null);
  const [formData, setFormData] = useState({
    clan_id: "",
    name: "",
    title: "",
    image_url: "",
    display_order: 1,
    user_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [panchsRes, clansRes, usersRes] = await Promise.all([
        supabase.from("clan_panchs").select("*").order("clan_id").order("display_order"),
        supabase.from("clans").select("id, name").order("name"),
        supabase.from("profiles").select("id, email"),
      ]);

      if (panchsRes.error) throw panchsRes.error;
      if (clansRes.error) throw clansRes.error;
      if (usersRes.error) throw usersRes.error;

      setPanchs(panchsRes.data || []);
      setClans(clansRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error: any) {
      toast.error("Failed to fetch data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from("clan-logos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("clan-logos")
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error("Failed to upload image: " + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPanch) {
        const { error } = await supabase
          .from("clan_panchs")
          .update({
            name: formData.name,
            title: formData.title,
            image_url: formData.image_url || null,
            display_order: formData.display_order,
            user_id: formData.user_id || null,
          })
          .eq("id", editingPanch.id);

        if (error) throw error;
        toast.success("Panch updated successfully");
      } else {
        const { error } = await supabase.from("clan_panchs").insert([
          {
            clan_id: formData.clan_id,
            name: formData.name,
            title: formData.title,
            image_url: formData.image_url || null,
            display_order: formData.display_order,
            user_id: formData.user_id || null,
          },
        ]);

        if (error) throw error;
        toast.success("Panch added successfully");
      }

      fetchData();
      resetForm();
      setOpen(false);
    } catch (error: any) {
      toast.error("Failed to save panch: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this panch?")) return;

    try {
      const { error } = await supabase.from("clan_panchs").delete().eq("id", id);
      if (error) throw error;
      toast.success("Panch deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error("Failed to delete panch: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      clan_id: "",
      name: "",
      title: "",
      image_url: "",
      display_order: 1,
      user_id: "",
    });
    setEditingPanch(null);
  };

  const openEditDialog = (panch: Panch) => {
    setEditingPanch(panch);
    setFormData({
      clan_id: panch.clan_id,
      name: panch.name,
      title: panch.title,
      image_url: panch.image_url || "",
      display_order: panch.display_order,
      user_id: panch.user_id || "",
    });
    setOpen(true);
  };

  if (loading) return <div>Loading...</div>;

  const groupedPanchs = clans.map((clan) => ({
    clan,
    panchs: panchs.filter((p) => p.clan_id === clan.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Manage Clan Panchs</h2>
          <p className="text-muted-foreground">Add up to 5 leaders for each clan</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Panch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPanch ? "Edit" : "Add"} Panch</DialogTitle>
              <DialogDescription>
                {editingPanch ? "Update" : "Add a new"} panch leader for a clan
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Clan</Label>
                <Select
                  value={formData.clan_id}
                  onValueChange={(value) => setFormData({ ...formData, clan_id: value })}
                  disabled={!!editingPanch}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select clan" />
                  </SelectTrigger>
                  <SelectContent>
                    {clans.map((clan) => (
                      <SelectItem key={clan.id} value={clan.id}>
                        {clan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Title/Role</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Chief Panch, Senior Panch"
                  required
                />
              </div>

              <div>
                <Label>Display Order (1-5)</Label>
                <Select
                  value={formData.display_order.toString()}
                  onValueChange={(value) => setFormData({ ...formData, display_order: parseInt(value) })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Image URL or Upload</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="Enter image URL"
                  />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4" />
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <Label>Link to User Account (Optional)</Label>
                <Select
                  value={formData.user_id}
                  onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Link this panch to a user account to allow them to edit team rosters
                </p>
              </div>

              <Button type="submit" className="w-full">
                {editingPanch ? "Update" : "Add"} Panch
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {groupedPanchs.map(({ clan, panchs: clanPanchs }) => (
          <Card key={clan.id}>
            <CardHeader>
              <CardTitle>{clan.name}</CardTitle>
              <CardDescription>
                {clanPanchs.length} / 5 Panchs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {clanPanchs.map((panch) => (
                  <Card key={panch.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-3">
                        {panch.image_url ? (
                          <img
                            src={panch.image_url}
                            alt={panch.name}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-2xl font-bold">
                              {panch.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="text-center">
                          <p className="font-semibold">{panch.name}</p>
                          <p className="text-sm text-muted-foreground">{panch.title}</p>
                          <p className="text-xs text-muted-foreground">Position: {panch.display_order}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(panch)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(panch.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
