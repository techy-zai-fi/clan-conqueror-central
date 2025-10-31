import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";
import { z } from "zod";

// Validation schemas for CSV data
const clanSchema = z.object({
  id: z.string().length(2, "Clan code must be exactly 2 characters"),
  name: z.string().min(1, "Clan name is required").max(100, "Clan name too long"),
  logo_url: z.string().url("Invalid logo URL").max(500, "Logo URL too long"),
  quote: z.string().max(500, "Quote too long").optional(),
  bg_image: z.string().max(500, "Background image URL too long").optional(),
  display_order: z.string().regex(/^\d*$/, "Display order must be a number").optional(),
  main_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format (use #RRGGBB)").max(7),
  sub_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid sub-color format (use #RRGGBB)").max(7).optional(),
});

const memberSchema = z.object({
  email: z.string().email("Invalid email format").max(255, "Email too long").optional(),
  reg_num: z.string().max(50, "Registration number too long").optional(),
  name: z.string().min(1, "Member name is required").max(100, "Member name too long"),
  gender: z.string().max(20, "Gender value too long").optional(),
  clan: z.string().length(2, "Clan code must be exactly 2 characters"),
  batch: z.string().max(50, "Batch value too long").optional(),
  year: z.string().regex(/^\d*$/, "Year must be a number").optional(),
});

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
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Validate row data
        const validated = clanSchema.parse(row);
        
        const { error } = await supabase
          .from('clans')
          .upsert({
            clan_code: validated.id,
            name: validated.name,
            logo: validated.logo_url,
            tagline: validated.quote || '',
            mascot: '', // Default empty mascot
            bg_image: validated.bg_image || null,
            display_order: validated.display_order ? parseInt(validated.display_order) : null,
            color: validated.main_color,
            sub_color: validated.sub_color || null,
          }, { onConflict: 'clan_code' });
        
        if (error) {
          errorCount++;
          errors.push(`Row ${i + 2}: Database error - ${error.message}`);
        } else {
          successCount++;
        }
      } catch (error) {
        errorCount++;
        if (error instanceof z.ZodError) {
          const fieldErrors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
          errors.push(`Row ${i + 2} (${row.name || 'Unknown'}): ${fieldErrors}`);
        } else {
          errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
    
    if (errorCount > 0) {
      console.error('Import errors:', errors);
      throw new Error(`Imported ${successCount} clans, but ${errorCount} failed. Check console for details.`);
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
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Validate row data
        const validated = memberSchema.parse(row);
        
        if (!clanMap.has(validated.clan)) {
          errorCount++;
          errors.push(`Row ${i + 2} (${validated.name}): Clan code "${validated.clan}" not found`);
          continue;
        }
        
        const { error } = await supabase
          .from('clan_members')
          .upsert({
            reg_num: validated.reg_num || null,
            clan_id: validated.clan,
            name: validated.name,
            email: validated.email || null,
            gender: validated.gender || null,
            batch: validated.batch || null,
            year: validated.year ? parseInt(validated.year) : null,
          }, { onConflict: 'reg_num' });
        
        if (error) {
          errorCount++;
          errors.push(`Row ${i + 2} (${validated.name}): Database error - ${error.message}`);
        } else {
          successCount++;
        }
      } catch (error) {
        errorCount++;
        if (error instanceof z.ZodError) {
          const fieldErrors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
          errors.push(`Row ${i + 2} (${row.name || 'Unknown'}): ${fieldErrors}`);
        } else {
          errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
    
    if (errorCount > 0) {
      console.error('Import errors:', errors);
      throw new Error(`Imported ${successCount} members, but ${errorCount} failed. Check console for details.`);
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
