import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";

export function AdminCSVImport() {
  const [clansFile, setClansFile] = useState<File | null>(null);
  const [membersFile, setMembersFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const parseCSV = (text: string, delimiter: string = ';'): any[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(delimiter);
    
    return lines.slice(1).map(line => {
      const values = line.split(delimiter);
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index]?.trim() || null;
      });
      return obj;
    });
  };

  const importClans = async (file: File) => {
    const text = await file.text();
    const data = parseCSV(text, ';');
    
    for (const row of data) {
      const { error } = await supabase
        .from('clans')
        .upsert({
          clan_code: row.id, // Use id as clan_code (2-char)
          name: row.name,
          logo: row.logo_url,
          tagline: row.quote,
          mascot: '', // Default empty mascot
          bg_image: row.bg_image,
          display_order: parseInt(row.display_order) || null,
          color: row.main_color,
          sub_color: row.sub_color,
        }, { onConflict: 'clan_code' });
      
      if (error) {
        console.error('Error importing clan:', row.name, error);
        throw error;
      }
    }
  };

  const importMembers = async (file: File) => {
    const text = await file.text();
    const data = parseCSV(text, ';');
    
    // First, get all clan codes mapping
    const { data: clans } = await supabase
      .from('clans')
      .select('clan_code, name');
    
    const clanMap = new Map(clans?.map(c => [c.clan_code, c.clan_code]) || []);
    
    for (const row of data) {
      const clanCode = row.clan; // This is the 2-char clan code from CSV
      
      if (!clanMap.has(clanCode)) {
        console.warn(`Clan ${clanCode} not found for member ${row.name}`);
        continue;
      }
      
      const { error } = await supabase
        .from('clan_members')
        .upsert({
          reg_num: row.reg_num,
          clan_id: clanCode, // Use the 2-char clan code
          name: row.name,
          email: row.email,
          gender: row.gender,
          batch: row.batch,
          year: parseInt(row.year) || null,
        }, { onConflict: 'reg_num' });
      
      if (error) {
        console.error('Error importing member:', row.name, error);
        throw error;
      }
    }
  };

  const handleImport = async () => {
    if (!clansFile && !membersFile) {
      toast.error("Please select at least one CSV file to import");
      return;
    }

    setImporting(true);
    try {
      if (clansFile) {
        await importClans(clansFile);
        toast.success(`Clans imported successfully`);
      }
      
      if (membersFile) {
        await importMembers(membersFile);
        toast.success(`Members imported successfully`);
      }
      
      // Clear files
      setClansFile(null);
      setMembersFile(null);
      
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input: any) => input.value = '');
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Import CSV Data</h2>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="clans-csv">Clans CSV File</Label>
            <Input
              id="clans-csv"
              type="file"
              accept=".csv"
              onChange={(e) => setClansFile(e.target.files?.[0] || null)}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Expected columns: id, name, logo_url, quote, bg_image, display_order, main_color, sub_color
            </p>
          </div>

          <div>
            <Label htmlFor="members-csv">Clan Members CSV File</Label>
            <Input
              id="members-csv"
              type="file"
              accept=".csv"
              onChange={(e) => setMembersFile(e.target.files?.[0] || null)}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Expected columns: email, reg_num, name, gender, clan, batch, year
            </p>
          </div>
        </div>

        <Button 
          onClick={handleImport} 
          disabled={importing || (!clansFile && !membersFile)}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {importing ? "Importing..." : "Import CSV Files"}
        </Button>
      </Card>

      <Card className="p-4 bg-muted">
        <h3 className="font-semibold mb-2">Import Instructions:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>CSV files should use semicolon (;) as delimiter</li>
          <li>Import clans first, then members (members reference clan IDs)</li>
          <li>Existing records will be updated based on ID/reg_num</li>
          <li>Make sure clan IDs in members CSV match clan IDs in clans CSV</li>
        </ul>
      </Card>
    </div>
  );
}
