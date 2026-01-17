"use client";

import { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';

const TermsAndConditions: NextPage = () => {
  const [accepted, setAccepted] = useState(false);

  return (
    <>    
      <Head>
        <title>Terms and Conditions - VibeShared</title>
        <meta name="description" content="VibeShared Terms and Conditions" />
      </Head>

      <div className="container py-1">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            {/* Main Content */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="bg-light p-4 rounded mb-4 border-start border-5 border-primary">
                  <h4 className="text-primary">
                    <i className="fas fa-exclamation-circle me-2"></i>Important Notice
                  </h4>
                  <p className="mb-0">
                    By accessing or using VibeShared, you agree to be bound by these Terms and Conditions. 
                    If you disagree with any part of the terms, you may not access our platform.
                  </p>
                </div>
                
                <h3 id="item-1" className="h4 border-bottom pb-2 mb-3">
                  <i className="fas fa-check-circle text-primary me-2"></i>1. Acceptance of Terms
                </h3>
                <p>
                  By registering for, accessing, browsing, or using the VibeShared platform, you acknowledge 
                  that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy.
                </p>
                
                <h3 id="item-2" className="h4 border-bottom pb-2 mb-3 mt-4">
                  <i className="fas fa-user-check text-primary me-2"></i>2. User Responsibilities
                </h3>
                <p>As a user of VibeShared, you are responsible for:</p>
                <ul>
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and complete information</li>
                  <li>Notifying us immediately of any unauthorized use of your account</li>
                  <li>Complying with all applicable laws and regulations</li>
                </ul>
                
                <h3 id="item-3" className="h4 border-bottom pb-2 mb-3 mt-4">
                  <i className="fas fa-ban text-primary me-2"></i>3. Prohibited Content
                </h3>
                <p>Users are strictly prohibited from posting, sharing, or transmitting content that:</p>
                
                <div className="bg-light p-3 mb-2 rounded border-start border-3 border-danger">
                  <i className="fas fa-exclamation-triangle text-danger me-2"></i> 
                  <strong>Illegal Activities:</strong> Content that promotes or facilitates illegal activities, including violence, theft, fraud, or drug abuse.
                </div>
                
                <div className="bg-light p-3 mb-2 rounded border-start border-3 border-danger">
                  <i className="fas fa-exclamation-triangle text-danger me-2"></i> 
                  <strong>Adult Content:</strong> Pornographic, sexually explicit, or obscene material of any kind.
                </div>
                
                <div className="bg-light p-3 mb-2 rounded border-start border-3 border-danger">
                  <i className="fas fa-exclamation-triangle text-danger me-2"></i> 
                  <strong>Hate Speech:</strong> Content that promotes violence or hatred against individuals or groups based on race, ethnicity, religion, disability, gender, age, or sexual orientation.
                </div>
                
                <div className="bg-light p-3 mb-2 rounded border-start border-3 border-danger">
                  <i className="fas fa-exclamation-triangle text-danger me-2"></i> 
                  <strong>Harassment:</strong> Bullying, intimidation, or harassment of individuals or organizations.
                </div>
                
                <div className="bg-light p-3 mb-2 rounded border-start border-3 border-danger">
                  <i className="fas fa-exclamation-triangle text-danger me-2"></i> 
                  <strong>Violent Content:</strong> Graphic violence, including violent imagery or content that encourages violence.
                </div>
                
                <div className="bg-light p-3 mb-2 rounded border-start border-3 border-danger">
                  <i className="fas fa-exclamation-triangle text-danger me-2"></i> 
                  <strong>Copyright Infringement:</strong> Sharing content that infringes on intellectual property rights of others.
                </div>
                
                <div className="bg-light p-3 mb-2 rounded border-start border-3 border-danger">
                  <i className="fas fa-exclamation-triangle text-danger me-2"></i> 
                  <strong>False Information:</strong> Spreading misinformation, fake news, or deceptive content.
                </div>
                
                <div className="bg-light p-3 mb-2 rounded border-start border-3 border-danger">
                  <i className="fas fa-exclamation-triangle text-danger me-2"></i> 
                  <strong>Spam:</strong> Unsolicited promotional content, chain messages, or repetitive posts.
                </div>
                
                <div className="bg-light p-3 mb-2 rounded border-start border-3 border-danger">
                  <i className="fas fa-exclamation-triangle text-danger me-2"></i> 
                  <strong>Personal Data:</strong> Sharing private personal information of others without consent.
                </div>
                
                <div className="bg-light p-3 mb-2 rounded border-start border-3 border-danger">
                  <i className="fas fa-exclamation-triangle text-danger me-2"></i> 
                  <strong>Harmful Content:</strong> Content that could cause harm, including dangerous challenges, misinformation about health, or instructions for self-harm.
                </div>
                
                <h3 id="item-4" className="h4 border-bottom pb-2 mb-3 mt-4">
                  <i className="fas fa-copyright text-primary me-2"></i>4. Intellectual Property
                </h3>
                <p>
                  All content on VibeShared, including text, graphics, logos, and software, is the property of 
                  VibeShared or its content suppliers and protected by international copyright laws.
                </p>
                <p>
                  Users retain ownership of content they post but grant VibeShared a worldwide, royalty-free 
                  license to use, distribute, and display such content.
                </p>
                
                <h3 id="item-5" className="h4 border-bottom pb-2 mb-3 mt-4">
                  <i className="fas fa-user-shield text-primary me-2"></i>5. Privacy Policy
                </h3>
                <p>
                  Your privacy is important to us. Our <Link href='/privacy' >Privacy Policy</Link> explains how we collect, use, and protect 
                  your personal information. By using VibeShared, you consent to our collection and use of personal 
                  data as outlined in our Privacy Policy.
                </p>
                
                <h3 id="item-6" className="h4 border-bottom pb-2 mb-3 mt-4">
                  <i className="fas fa-user-slash text-primary me-2"></i>6. Account Termination
                </h3>
                <p>
                  We reserve the right to suspend or terminate your account at our sole discretion if we believe 
                  you have violated these Terms and Conditions or applicable laws.
                </p>
                <p>Accounts may be terminated for:</p>
                <ul>
                  <li>Repeated violations of our content policies</li>
                  <li>Engaging in illegal activities on the platform</li>
                  <li>Creating multiple accounts for abusive purposes</li>
                  <li>Impersonating others or providing false information</li>
                </ul>

                <h3 id="item-7" className="h4 border-bottom pb-2 mb-3 mt-4">
                  <i className="fas fa-money-bill-wave text-primary me-2"></i>7. Platform Fees
                </h3>
                <p>
                  VibeShared charges a <strong>30% platform fee</strong> on all tip revenue. The remaining 70% is credited to the creator’s wallet. 
                  This fee supports platform operations, maintenance, and growth.
                </p>

                <h3 id="item-8" className="h4 border-bottom pb-2 mb-3 mt-4">
                  <i className="fas fa-undo text-primary me-2"></i>8. Refund & Chargeback Policy
                </h3>
                <p>
                  All tips are final and non-refundable. Users are not entitled to chargebacks or refunds 
                  for tips made through the platform, except where required by law.
                </p>

                <h3 id="item-9" className="h4 border-bottom pb-2 mb-3 mt-4">
                  <i className="fas fa-wallet text-primary me-2"></i>9. Payout Policy
                </h3>
                <p>
                  Creators may withdraw available funds from their wallet once they reach the minimum payout threshold. 
                  Payouts are processed within 7 business days and may be subject to third-party processing fees.
                </p>

                <h3 id="item-10" className="h4 border-bottom pb-2 mb-3 mt-4">
                  <i className="fas fa-child text-primary me-2"></i>10. Age Restriction
                </h3>
                <p>
                  You must be at least 13 years old (or the minimum age of digital consent in your country) to use VibeShared. 
                  Users under 18 must have parental or guardian consent.
                </p>

                <h3 id="item-11" className="h4 border-bottom pb-2 mb-3 mt-4">
                  <i className="fas fa-balance-scale text-primary me-2"></i>11. Limitation of Liability
                </h3>
                <p>
                  VibeShared shall not be held liable for any indirect, incidental, consequential, or punitive damages 
                  resulting from the use or inability to use our platform.
                </p>

                <h3 id="item-12" className="h4 border-bottom pb-2 mb-3 mt-4">
                  <i className="fas fa-gavel text-primary me-2"></i>12. Dispute Resolution
                </h3>
                <p>
                  Any disputes or claims must first be submitted to VibeShared support at <strong>support@vibeshared.com</strong> 
                  before pursuing legal remedies.
                </p>

                <h3 id="item-13" className="h4 border-bottom pb-2 mb-3 mt-4">
                  <i className="fas fa-receipt text-primary me-2"></i>13. Taxes
                </h3>
                <p>
                  Creators are solely responsible for reporting and paying any applicable taxes on income earned through VibeShared.
                </p>
                
                <h3 id="item-14" className="h4 border-bottom pb-2 mb-3 mt-4">
                  <i className="fas fa-info-circle text-primary me-2"></i>14. Disclaimer
                </h3>
                <p>
                  VibeShared is provided on an "as-is" and "as-available" basis. We do not guarantee that the 
                  service will be uninterrupted, secure, or error-free.
                </p>
                <p>
                  We are not responsible for the content posted by users and do not endorse any user-generated content.
                </p>
                
                <h3 id="item-15" className="h4 border-bottom pb-2 mb-3 mt-4">
                  <i className="fas fa-pencil-alt text-primary me-2"></i>15. Changes to Terms
                </h3>
                <p>
                  We may modify these Terms and Conditions at any time. We will provide notice of significant 
                  changes through our platform or via email. Continued use of VibeShared after changes constitutes 
                  acceptance of the modified terms.
                </p>
                
                <h3 id="item-16" className="h4 border-bottom pb-2 mb-3 mt-4">
                  <i className="fas fa-balance-scale text-primary me-2"></i>16. Governing Law
                </h3>
                <p>
                  These Terms and Conditions are governed by and construed in accordance with the laws of the 
                  State of California, without regard to its conflict of law provisions.
                </p>
              </div>
            </div>
            
            {/* Acceptance Section */}
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h4>Acceptance of Terms</h4>
                <p>By checking this box, you acknowledge that you have read and agree to our Terms and Conditions</p>
                <div className="form-check d-inline-block mb-3">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="acceptTerms"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="acceptTerms">
                    I Accept the Terms and Conditions
                  </label>
                </div>
                <div className="mt-3">
                  <button 
                    className="btn btn-primary" 
                    disabled={!accepted}
                    onClick={() => alert('Thank you for accepting our Terms and Conditions!')}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;
