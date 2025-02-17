import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto max-w-3xl py-8 px-4"
    >
      <Card>
        <CardHeader>
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to voting
          </Link>
          <CardTitle>Privacy Policy for Election Poll 2025</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>Last updated: February 2024</p>

          <h2>1. Introduction</h2>
          <p>
            This Privacy Policy explains how Election Poll 2025 ("we", "us", or "our") collects, uses, 
            and protects your personal information during the voting process.
          </p>

          <h2>2. Information We Collect</h2>
          <ul>
            <li>Full Name</li>
            <li>Contact Number</li>
            <li>Barangay Information</li>
            <li>Voting Choices</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information for:</p>
          <ul>
            <li>Verifying voter identity and preventing duplicate voting</li>
            <li>Ensuring the integrity of the election process</li>
            <li>Generating anonymous statistical data</li>
            <li>Contacting voters if necessary regarding their submitted votes</li>
          </ul>

          <h2>4. Data Protection</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against 
            unauthorized or unlawful processing, accidental loss, destruction, or damage.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            Your personal information will be retained only for the duration of the election period and will be 
            securely deleted afterward, except where we are legally required to retain certain information.
          </p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Request correction of your personal information</li>
            <li>Request deletion of your personal information</li>
            <li>Object to processing of your personal information</li>
            <li>Request restriction of processing your personal information</li>
          </ul>

          <h2>7. Contact Information</h2>
          <p>
            For any questions or concerns about this Privacy Policy or our data practices, please contact us at:
            <br />
            Email: privacy@electionpoll2025.com
            <br />
            Phone: (123) 456-7890
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with 
            an updated revision date.
          </p>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Note: This is a sample privacy policy. Please replace with your actual privacy policy content 
              before deployment.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PrivacyPolicy;
