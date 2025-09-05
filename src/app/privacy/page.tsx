import style from '@/styles/componenet/Privacy Policy/privacypolicy.module.css';
import Link from 'next/link';



export default function PrivacyPolicyPage() {
  return (
    <div className={`max-w-3xl container p-6 text-gray-800 ${style.privacy}`}>
      <div className="card shadow p-4">
        <h1 className="mb-4">Privacy Policy</h1>

        <p>
          This Privacy Policy describes how <strong>VibeShared</strong> ("we",
          "our", or "us") collects, uses, and protects your personal information
          when you use our website and services. By accessing or using our
          platform, you agree to the terms of this Privacy Policy.
        </p>

        <h2 className="mt-4 mb-3">1. Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul>
          <li>
            <strong>Account Information:</strong> When you sign in using
            third-party providers (Google, Facebook, Twitter), we collect your
            name, email address, and profile picture (if available).
          </li>
          <li>
            <strong>Usage Data:</strong> Information about how you interact with
            our site, such as pages visited, time spent, and browser/device
            details.
          </li>
          <li>
            <strong>Cookies and Tracking:</strong> We use cookies and similar
            technologies to maintain sessions, improve your experience, and
            analyze traffic.
          </li>
        </ul>

        <h2 className="mt-4 mb-3">2. How We Use Your Information</h2>
        <p>We use the information collected to:</p>
        <ul>
          <li>Provide authentication and secure account access</li>
          <li>Personalize and improve our services</li>
          <li>Respond to support requests</li>
          <li>Monitor and enhance platform security</li>
          <li>Comply with legal requirements</li>
        </ul>

        <h2 className="mt-4 mb-3">3. Sharing of Information</h2>
        <p>
          We do <strong>not</strong> sell, rent, or trade your personal
          information. We may share data only:
        </p>
        <ul>
          <li>
            With service providers that support operations (hosting, analytics,
            or security providers)
          </li>
          <li>When required by law or government authorities</li>
          <li>
            In case of a business transfer, merger, or acquisition, where data
            may be transferred
          </li>
        </ul>

        <h2 className="mt-4 mb-3">4. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to
          protect your information from unauthorized access, misuse, or loss.
          However, no system is 100% secure, and we cannot guarantee absolute
          protection.
        </p>

        <h2 className="mt-4 mb-3">5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate or incomplete data</li>
          <li>Request deletion of your personal data</li>
          <li>
            Contact us for any questions at{" "}
            <Link href="mailto:vibeshared@gmail.com">vibeshared@gmail.com</Link>
          </li>
        </ul>

        <h2 className="mt-4 mb-3">6. Updates to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Updates will be
          posted on this page with a revised date.
        </p>

        <p className="text-muted mt-5">
          Last updated: 5/9/2025
        </p>
      </div>
    </div>
  )
}
