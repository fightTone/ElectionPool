import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const PrivacyPolicy = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto max-w-4xl py-8 px-4"
    >
      <Card>
        <CardHeader>
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to voting
          </Link>
          <CardTitle>Legal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="privacy" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
              <TabsTrigger value="terms">Terms of Use</TabsTrigger>
            </TabsList>
            
            <TabsContent 
              value="privacy" 
              className="prose dark:prose-invert max-w-none [&>h2]:mt-6 [&>h3]:mt-4 [&>p]:mt-2 [&>ul]:mt-2"
            >
              {/* Privacy Policy Content */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Privacy Policy</h2>
                  <p className="text-sm text-muted-foreground">
                    Effective Date: February 17, 2024<br />
                    Last Updated: February 17, 2024
                  </p>
                </div>

                <h3>1. Introduction</h3>
                <p>
                  Welcome to Election Poll 2025 ("we," "us," or "our"). Your privacy is important to us, 
                  and we are committed to protecting your personal information. This Privacy Policy explains 
                  how we collect, use, store, and share your personal data when you use our election polling app.
                </p>
                <p>
                  By using Election Poll 2025, you consent to the collection, use, and sharing of your 
                  information as described in this policy.
                </p>

                <h3>2. Information We Collect</h3>
                <p>When you participate in our poll, we collect the following personal data:</p>
                <ul>
                  <li>Full Name</li>
                  <li>Phone Number</li>
                  <li>Barangay</li>
                  <li>Email Address</li>
                </ul>
                <p>We do not collect sensitive information such as government-issued IDs, passwords, or financial details.</p>

                <h3>3. How We Use Your Information</h3>
                <p>The data we collect is used solely for the purpose of showing the majority and minority results of the poll. Specifically, we use your information for:</p>
                <ul>
                  <li>Verifying voter identity and preventing duplicate voting</li>
                  <li>Ensuring the integrity of the election process</li>
                  <li>Generating anonymous statistical data</li>
                  <li>Contacting voters if necessary regarding their submitted votes</li>
                </ul>

                <h3>4. Data Storage and Retention</h3>
                <ul>
                  <li>Your personal data will be stored securely in our database</li>
                  <li>We will delete all collected data 10 days after the election</li>
                  <li>Until the deletion period, your data may be stored, accessed, and processed for the sole purpose of maintaining the integrity of the poll</li>
                </ul>

                <h3>5. Data Sharing Policy</h3>
                <p>
                  We may share collected data with third parties, but only if we decide to do so. We retain full control over who receives this data.
                </p>
                <ul>
                  <li>Any shared data will be for research, reporting, or analysis purposes</li>
                  <li>We will not sell, rent, or trade your personal information to any third-party advertisers or marketers</li>
                </ul>

                <h3>6. Your Rights</h3>
                <p>You have the right to:</p>
                <ul>
                  <li>Access your personal information</li>
                  <li>Request correction of your personal information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Object to processing of your personal information</li>
                  <li>Request restriction of processing your personal information</li>
                </ul>

                <h3>7. Security Measures</h3>
                <p>
                  We implement industry-standard security measures to protect your personal information from 
                  unauthorized access, alteration, disclosure, or destruction. However, while we strive to 
                  protect your data, we cannot guarantee absolute security.
                </p>

                <h3>8. Changes to This Policy</h3>
                <p>
                  We may update this Privacy Policy from time to time. Any changes will be posted on this page, 
                  and significant updates may be communicated to users through email or app notifications.
                </p>

                <h3>9. Contact Information</h3>
                <p>
                  For any questions or concerns about this Privacy Policy or our data practices, please contact us at:
                  <br />
                  Email: privacy@electionpoll2025.com
                  <br />
                  Phone: (123) 456-7890
                </p>
              </div>
            </TabsContent>

            <TabsContent 
              value="terms" 
              className="prose dark:prose-invert max-w-none [&>h2]:mt-6 [&>h3]:mt-4 [&>p]:mt-2 [&>ul]:mt-2"
            >
              {/* Terms of Use Content */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Terms of Use</h2>
                  <p className="text-sm text-muted-foreground">
                    Effective Date: February 17, 2024<br />
                    Last Updated: February 17, 2024
                  </p>
                </div>

                <h3>1. Introduction</h3>
                <p>
                  These Terms of Use ("Terms") govern your use of Election Poll 2025 (the "App"). 
                  By using the App, you agree to comply with these Terms. If you do not agree with 
                  these Terms, do not use the App.
                </p>

                <h3>2. Eligibility</h3>
                <p>To use this App, you must:</p>
                <ul>
                  <li>Be at least 18 years old (or have parental/guardian consent if younger)</li>
                  <li>Provide accurate personal information when participating in the poll</li>
                </ul>

                <h3>3. Voting Process</h3>
                <ul>
                  <li>Each user is allowed to vote only once in the poll</li>
                  <li>The poll results are purely for informational and statistical purposes</li>
                  <li>The App is not an official government voting platform and does not influence actual election results</li>
                </ul>

                <h3>4. Data Collection and Usage</h3>
                <p>By using this App, you acknowledge and agree that:</p>
                <ul>
                  <li>We collect your name, phone number, barangay, and email before you vote</li>
                  <li>Your data is stored securely and will be deleted 10 days after the election</li>
                  <li>We may share collected data at our discretion, but only with parties we approve</li>
                  <li>We do not sell user data to third parties</li>
                </ul>

                <h3>5. User Responsibilities</h3>
                <p>You agree to:</p>
                <ul>
                  <li>Provide accurate and truthful information when voting</li>
                  <li>Not attempt to vote multiple times using different accounts</li>
                  <li>Respect the purpose of this polling app as a non-official voting system</li>
                </ul>
                <p>
                  Any attempt to manipulate results, hack the system, or interfere with data integrity 
                  may result in legal action.
                </p>

                <h3>6. Data Deletion Requests</h3>
                <p>
                  Users can request early deletion of their data by sending an email to privacy@electionpoll2025.com.
                  However, we retain full control over data retention and deletion.
                </p>

                <h3>7. Liability and Disclaimer</h3>
                <ul>
                  <li>We do not guarantee 100% accuracy of poll results</li>
                  <li>We are not responsible for how third parties may use shared data</li>
                  <li>We are not liable for any loss, damage, or misuse of data beyond our control</li>
                </ul>
                <p>
                  This App does not endorse any political party or candidate and is intended for 
                  informational purposes only.
                </p>

                <h3>8. Changes to These Terms</h3>
                <p>
                  We reserve the right to modify these Terms at any time. Any changes will be updated 
                  on this page, and users will be notified if necessary.
                </p>

                <h3>9. Contact Us</h3>
                <p>
                  If you have any concerns about these Terms, contact us at:
                  <br />
                  Email: privacy@electionpoll2025.com
                  <br />
                  Phone: (123) 456-7890
                </p>

                <h3>10. Governing Law</h3>
                <p>
                  These Terms and the App's operations are governed by the Data Privacy Act of 2012 
                  (RA 10173) of the Philippines and other relevant laws.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              For questions or concerns about our Privacy Policy or Terms of Use, please contact:<br />
              Email: privacy@electionpoll2025.com<br />
              Phone: (123) 456-7890
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PrivacyPolicy;

