
import { supabase } from '@/integrations/supabase/client';

export const createStorageBuckets = async () => {
  try {
    console.log('Checking storage buckets...');
    
    // Check if buckets already exist instead of trying to create them
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const existingBuckets = new Set(buckets.map(bucket => bucket.name));
    console.log('Existing buckets:', existingBuckets);
    
    // Only attempt to create buckets if they don't already exist
    if (!existingBuckets.has('payment-qrs')) {
      console.log('Creating payment-qrs bucket...');
      const { error: qrError } = await supabase.storage.createBucket(
        'payment-qrs',
        { public: true }
      );
      
      if (qrError) {
        console.error('Error creating payment-qrs bucket:', qrError);
      }
    }
    
    if (!existingBuckets.has('payment-screenshots')) {
      console.log('Creating payment-screenshots bucket...');
      const { error: screenshotError } = await supabase.storage.createBucket(
        'payment-screenshots',
        { public: true }
      );
      
      if (screenshotError) {
        console.error('Error creating payment-screenshots bucket:', screenshotError);
      }
    }
    
    console.log('Storage buckets setup complete');
  } catch (error) {
    console.error('Error checking/creating storage buckets:', error);
  }
};
