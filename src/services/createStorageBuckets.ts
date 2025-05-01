
import { supabase } from '@/integrations/supabase/client';

export const createStorageBuckets = async () => {
  // Create bucket for payment QR codes
  const { data: qrBucket, error: qrError } = await supabase.storage.createBucket(
    'payment-qrs',
    { public: true }
  );
  
  if (qrError && qrError.message !== 'Bucket already exists') {
    console.error('Error creating payment-qrs bucket:', qrError);
  }
  
  // Create bucket for payment screenshots
  const { data: screenshotBucket, error: screenshotError } = await supabase.storage.createBucket(
    'payment-screenshots',
    { public: true }
  );
  
  if (screenshotError && screenshotError.message !== 'Bucket already exists') {
    console.error('Error creating payment-screenshots bucket:', screenshotError);
  }
  
  console.log('Storage buckets setup complete');
};
