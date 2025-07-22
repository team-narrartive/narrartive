import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { migrateExistingImages } from '@/utils/migrateExistingImages';
import { useToast } from '@/hooks/use-toast';

export const Migration = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const { toast } = useToast();

  const handleMigration = async () => {
    setIsMigrating(true);
    
    try {
      await migrateExistingImages();
      toast({
        title: "Migration completed",
        description: "All Base64 images have been migrated to Supabase Storage."
      });
    } catch (error) {
      console.error('Migration failed:', error);
      toast({
        title: "Migration failed",
        description: "There was an error migrating the images. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Image Migration Tool</CardTitle>
          <CardDescription>
            Convert existing Base64 images in your database to Supabase Storage URLs for better performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleMigration} 
            disabled={isMigrating}
            className="w-full"
          >
            {isMigrating ? 'Migrating...' : 'Start Migration'}
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            This will upload all Base64 images to storage and update the database records with URLs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};