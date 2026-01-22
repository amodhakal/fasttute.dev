import Container from "@/components/Container";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-gray-300">
      <Container className="py-12">
        <h1 className="text-4xl font-bold text-red-500 mb-8">Terms of Service</h1>
        <p className="text-gray-400 mb-8">Last updated: January 21, 2026</p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Fasttute.dev (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). By accessing or using our website and services, 
            you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, 
            please do not use our services.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
          <p className="mb-4">
            Fasttute.dev provides an AI-powered platform that transforms YouTube video tutorials into 
            interactive learning environments. Our services include video analysis, transcripts, chapters, 
            chat functionality, and other educational tools designed to enhance your learning experience.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts and Registration</h2>
          <p className="mb-4">
            To access certain features of our services, you must create an account using a valid email 
            address or through third-party authentication services like Clerk. You are responsible for 
            maintaining the confidentiality of your account credentials and for all activities that occur 
            under your account.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">4. User Content and Conduct</h2>
          <p className="mb-4">
            You retain ownership of any content you submit through our services (&quot;User Content&quot;). 
            By submitting User Content, you grant us a non-exclusive, worldwide, royalty-free license to 
            use, reproduce, and display such content solely for the purpose of providing and improving 
            our services.
          </p>
          <p className="mb-4">
            You agree not to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Submit content that violates any laws or regulations</li>
            <li>Submit content that infringes on the rights of others</li>
            <li>Use the service for any illegal or unauthorized purpose</li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Attempt to gain unauthorized access to any systems or networks</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">5. Intellectual Property Rights</h2>
          <p className="mb-4">
            All content and materials on Fasttute.dev, including but not limited to text, graphics, 
            logos, icons, images, audio clips, and software, are the property of Fasttute.dev or its 
            licensors and are protected by copyright, trademark, and other intellectual property laws.
          </p>
          <p className="mb-4">
            Our services may access YouTube videos and their associated metadata. We do not claim 
            ownership of any YouTube content. Your use of YouTube content is subject to YouTube&apos;s 
            Terms of Service.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">6. AI-Generated Content</h2>
          <p className="mb-4">
            Our platform uses artificial intelligence to generate transcripts, summaries, chapters, 
            and other educational content. While we strive for accuracy, AI-generated content may 
            contain errors or inaccuracies. You acknowledge that AI-generated content is provided 
            &quot;as is&quot; and should be verified independently when critical.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">7. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account and access to our services at our sole discretion, 
            without prior notice, for conduct that we believe violates these Terms or is harmful to 
            other users, us, or third parties.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
          <p className="mb-4">
            To the maximum extent permitted by law, Fasttute.dev shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages, or any loss of profits or revenues, 
            whether incurred directly or indirectly, or any loss of data, use, goodwill, or other 
            intangible losses resulting from your use of our services.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">9. Disclaimer of Warranties</h2>
          <p className="mb-4">
            OUR SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, 
            EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, 
            FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these Terms at any time. We will notify users of any 
            material changes by posting the new Terms on this page and updating the &quot;Last updated&quot; 
            date. Your continued use of the service after any changes constitutes acceptance of the 
            new Terms.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">11. Governing Law</h2>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with applicable laws, 
            without regard to conflict of law principles.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Information</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="mb-4">
            <strong>Email:</strong> amodhakal@gmail.com
          </p>
        </section>
      </Container>
    </div>
  );
}
