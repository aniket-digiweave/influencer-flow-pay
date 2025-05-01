
import React, { useEffect, useState } from 'react';
import PageLayout from "@/components/layouts/PageLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch influencer submissions
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('influencer_submissions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (submissionsError) throw submissionsError;
        setSubmissions(submissionsData || []);
        
        // Fetch client payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('client_payments')
          .select(`
            *,
            influencer_submissions:matched_submission_id (
              brand,
              influencer_name,
              email,
              payment_method
            )
          `)
          .order('created_at', { ascending: false });
        
        if (paymentsError) throw paymentsError;
        setPayments(paymentsData || []);
      } catch (error: any) {
        toast({
          title: "Error fetching data",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        
        <Tabs defaultValue="submissions">
          <TabsList>
            <TabsTrigger value="submissions">Influencer Submissions</TabsTrigger>
            <TabsTrigger value="payments">Client Payments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="submissions" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Influencer Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment ID</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Influencer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              No submissions found
                            </TableCell>
                          </TableRow>
                        ) : (
                          submissions.map((submission) => (
                            <TableRow key={submission.id}>
                              <TableCell className="font-mono">{submission.payment_id}</TableCell>
                              <TableCell>{submission.brand}</TableCell>
                              <TableCell>{submission.influencer_name}</TableCell>
                              <TableCell>₹{submission.amount}</TableCell>
                              <TableCell>{submission.payment_method}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  submission.payment_status === 'Paid' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {submission.payment_status}
                                </span>
                              </TableCell>
                              <TableCell>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment ID</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Influencer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Screenshot</TableHead>
                          <TableHead>Confirmed At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                              No payment confirmations found
                            </TableCell>
                          </TableRow>
                        ) : (
                          payments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell className="font-mono">{payment.payment_id}</TableCell>
                              <TableCell>{payment.influencer_submissions?.brand || 'N/A'}</TableCell>
                              <TableCell>{payment.influencer_submissions?.influencer_name || 'N/A'}</TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {payment.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                <a 
                                  href={payment.screenshot_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View
                                </a>
                              </TableCell>
                              <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;
