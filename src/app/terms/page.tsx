'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container px-4 sm:px-6 md:px-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-headline">
              Terms and Conditions
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Please read these terms carefully before using our service
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
          <Card className="border-2">
            <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12 space-y-6 sm:space-y-8">
              <div className="prose prose-sm sm:prose-base max-w-none">
                {/* Introduction */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-0 mb-4">
                  1. Introduction
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  These Terms of Service (&ldquo;Terms&rdquo;, &ldquo;Terms of Service&rdquo;) govern your use of our website located at www.tokea.com (together or individually &ldquo;Service&rdquo;) operated by Tokea Company Limited.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Our Privacy Policy also governs your use of our Service and explains how we collect, safeguard and disclose information that results from your use of our web pages.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Your agreement with us includes these Terms and our Privacy Policy (&ldquo;Agreements&rdquo;). You acknowledge that you have read and understood Agreements, and agree to be bound of them.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  If you do not agree with (or cannot comply with) Agreements, then you may not use the Service, but please let us know by emailing at info@tokea.com so we can try to find a solution. These Terms apply to all visitors, users and others who wish to access or use Service.
                </p>

                {/* Communications */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  2. Communications
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  By using our Service, you agree to subscribe to newsletters, marketing or promotional materials and other information we may send. However, you may opt out of receiving any, or all, of these communications from us by following the unsubscribe link or by emailing at info@tokea.com.
                </p>

                {/* Purchases */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  3. Purchases
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  If you wish to purchase any product or service made available through Service (&ldquo;Purchase&rdquo;), you may be asked to supply certain information relevant to your Purchase including but not limited to, your credit or debit card number, the expiration date of your card, your billing address, and your shipping information.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  You represent and warrant that: (i) you have the legal right to use any card(s) or other payment method(s) in connection with any Purchase; and that (ii) the information you supply to us is true, correct and complete.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  We may employ the use of third-party services for the purpose of facilitating payment and the completion of Purchases. By submitting your information, you grant us the right to provide the information to these third parties subject to our Privacy Policy.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  We reserve the right to refuse or cancel your order at any time for reasons including but not limited to: product or service availability, errors in the description or price of the product or service, error in your order or other reasons.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  We reserve the right to refuse or cancel your order if fraud or an unauthorized or illegal transaction is suspected.
                </p>

                {/* Contests, Sweepstakes and Promotions */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  4. Contests, Sweepstakes and Promotions
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Any contests, sweepstakes or other promotions (collectively, &ldquo;Promotions&rdquo;) made available through Service may be governed by rules that are separate from these Terms of Service. If you participate in any Promotions, please review the applicable rules as well as our Privacy Policy. If the rules for a Promotion conflict with these Terms of Service, Promotion rules will apply.
                </p>

                {/* Content */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  5. Content
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Our Service allows promoters and event owners you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material (&ldquo;Content&rdquo;). You are responsible for Content that you post on or through Service, including its legality, reliability, and appropriateness.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  By posting Content on or through Service, You represent and warrant that: (i) Content is yours (you own it) and/or you have the right to use it and the right to grant us the rights and license as provided in these Terms, and (ii) that the posting of your Content on or through Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person or entity. We reserve the right to terminate the account of anyone found to be infringing on a copyright.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  You retain any and all of your rights to any Content you submit, post or display on or through Service and you are responsible for protecting those rights. We take no responsibility and assume no liability for Content you or any third-party posts on or through Service. However, by posting Content using Service you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through Service. You agree that this license includes the right for us to make your Content available to other users of Service, who may also use your Content subject to these Terms.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Tokea Company Limited has the right but not the obligation to monitor and edit all Content provided by users.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  In addition, Content found on or through this Service are the property of Tokea Company Limited or used with permission. You may not distribute, modify, transmit, reuse, download, repost, copy, or use said Content, whether in whole or in part, for commercial purposes or for personal gain, without express advance written permission from us.
                </p>

                {/* Prohibited Uses */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  6. Prohibited Uses
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground mb-3">
                  You may use Service only for lawful purposes and in accordance with Terms. You agree not to use Service:
                </p>
                <ul className="list-decimal pl-6 sm:pl-8 space-y-2 text-sm sm:text-base text-muted-foreground mb-4">
                  <li>In any way that violates any applicable national or international law or regulation.</li>
                  <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</li>
                  <li>To transmit, or procure the sending of, any advertising or promotional material, including any &ldquo;junk mail&rdquo;, &ldquo;chain letter&rdquo;, &ldquo;spam&rdquo;, or any other similar solicitation.</li>
                  <li>To impersonate or attempt to impersonate Company, a Company employee, another user, or any other person or entity.</li>
                  <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful, or in connection with any unlawful, illegal, fraudulent, or harmful purpose or activity.</li>
                  <li>To engage in any other conduct that restricts or inhibits anyone&apos;s use or enjoyment of Service, or which, as determined by us, may harm or offend Company or users of Service or expose them to liability.</li>
                </ul>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground mb-3">
                  Additionally, you agree not to:
                </p>
                <ul className="list-decimal pl-6 sm:pl-8 space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li>Use Service in any manner that could disable, overburden, damage, or impair Service or interfere with any other party&apos;s use of Service, including their ability to engage in real time activities through Service.</li>
                  <li>Use any robot, spider, or other automatic device, process, or means to access Service for any purpose, including monitoring or copying any of the material on Service.</li>
                  <li>Use any manual process to monitor or copy any of the material on Service or for any other unauthorized purpose without our prior written consent.</li>
                  <li>Use any device, software, or routine that interferes with the proper working of Service.</li>
                  <li>Introduce any viruses, trojan horses, worms, logic bombs, or other material which is malicious or technologically harmful.</li>
                  <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of Service, the server on which Service is stored, or any server, computer, or database connected to Service.</li>
                  <li>Attack Service via a denial-of-service attack or a distributed denial-of-service attack.</li>
                  <li>Take any action that may damage or falsify Company rating.</li>
                  <li>Otherwise attempt to interfere with the proper working of Service.</li>
                </ul>

                {/* Analytics */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  7. Analytics
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  We may use third-party Service Providers to monitor and analyze the use of our Service.
                </p>

                {/* No Use by Minors */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  8. No Use by Minors
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Service is intended only for access and use by individuals at least eighteen (18) years old. By accessing or using Service, you warrant and represent that you are at least eighteen (18) years of age and with the full authority, right, and capacity to enter into this agreement and abide by all of the terms and conditions of Terms. If you are not at least eighteen (18) years old, you are prohibited from both the access and usage of Service.
                </p>

                {/* Accounts */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  9. Accounts
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  When you create an account with us, you guarantee that you are above the age of 18, and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on Service.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password, whether your password is with our Service or a third-party service. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  You may not use as a username the name of another person or entity or that is not lawfully available for use, a name or trademark that is subject to any rights of another person or entity other than you, without appropriate authorization. You may not use as a username any name that is offensive, vulgar or obscene.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  We reserve the right to refuse service, terminate accounts, remove or edit content, or cancel orders in our sole discretion.
                </p>

                {/* Intellectual Property */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  10. Intellectual Property
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of Tokea Company Limited and its licensors. Service is protected by copyright, trademark, and other laws of and foreign countries. Our trademarks may not be used in connection with any product or service without the prior written consent of Tokea Company Limited.
                </p>

                {/* Copyright Policy */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  11. Copyright Policy
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  We respect the intellectual property rights of others. It is our policy to respond to any claim that Content posted on Service infringes on the copyright or other intellectual property rights (&ldquo;Infringement&rdquo;) of any person or entity.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  If you are a copyright owner, or authorized on behalf of one, and you believe that the copyrighted work has been copied in a way that constitutes copyright infringement, please submit your claim via email to info@tokea.com, with the subject line: &ldquo;Copyright Infringement&rdquo; and include in your claim a detailed description of the alleged Infringement.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  You may be held accountable for damages (including costs and attorneys&apos; fees) for misrepresentation or bad-faith claims on the infringement of any Content found on and/or through Service on your copyright.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  You can contact our Copyright Agent via email at info@tokea.com.
                </p>

                {/* Error Reporting and Feedback */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  12. Error Reporting and Feedback
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  You may provide us either directly at info@tokea.com or via third party sites and tools with information and feedback concerning errors, suggestions for improvements, ideas, problems, complaints, and other matters related to our Service (&ldquo;Feedback&rdquo;). You acknowledge and agree that: (i) you shall not retain, acquire or assert any intellectual property right or other right, title or interest in or to the Feedback; (ii) Company may have development ideas similar to the Feedback; (iii) Feedback does not contain confidential information or proprietary information from you or any third party; and (iv) Company is not under any obligation of confidentiality with respect to the Feedback.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  In the event the transfer of the ownership to the Feedback is not possible due to applicable mandatory laws, you grant Company and its affiliates an exclusive, transferable, irrevocable, free-of-charge, sub-licensable, unlimited and perpetual right to use (including copy, modify, create derivative works, publish, distribute and commercialize) Feedback in any manner and for any purpose.
                </p>

                {/* Links To Other Web Sites */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  13. Links To Other Web Sites
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Our Service may contain links to third party web sites or services that are not owned or controlled by Tokea Company Limited.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Tokea Company Limited has no control over, and assumes no responsibility for the content, privacy policies, or practices of any third-party web sites or services. We do not warrant the offerings of any of these entities/individuals or their websites.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  You acknowledge and agree that company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such third party web sites or services.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-semibold">
                  WE STRONGLY ADVISE YOU TO READ THE TERMS OF SERVICE AND PRIVACY POLICIES OF ANY THIRD-PARTY WEB SITES OR SERVICES THAT YOU VISIT.
                </p>

                {/* Disclaimer Of Warranty */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  14. Disclaimer Of Warranty
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  These services are provided by company on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. Company makes no representations or warranties of any kind, express or implied, as to the operation of their services, or the information, content or materials included therein. You expressly agree that your use of these services, their content, and any services or items obtained from us is at your sole risk.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Neither company nor any person associated with company makes any warranty or representation with respect to the completeness, security, reliability, quality, accuracy, or availability of the services. Without limiting the foregoing, neither company nor anyone associated with company represents or warrants that the services, their content, or any services or items obtained through the services will be accurate, reliable, error-free, or uninterrupted, that defects will be corrected, that the services or the server that makes it available are free of viruses or other harmful components or that the services or any services or items obtained through the services will otherwise meet your needs or expectations.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Company hereby disclaims all warranties of any kind, whether express or implied, statutory, or otherwise, including but not limited to any warranties of merchantability, non-infringement, and fitness for particular purpose.
                </p>

                {/* Limitation Of Liability */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  15. Limitation Of Liability
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Except as prohibited by law, you will hold us and our officers, directors, employees, and agents harmless for any indirect, punitive, special, incidental, or consequential damage, however it arises (including attorneys&apos; fees and all related costs and expenses of litigation and arbitration, or at trial or on appeal, if any, whether or not litigation or arbitration is instituted), whether in an action of contract, negligence, or other tortious action, or arising out of or in connection with this agreement, including without limitation any claim for personal injury or property damage, arising from this agreement and any violation by you of any federal, state, or local laws, statutes, rules, or regulations, even if company has been previously advised of the possibility of such damage. Except as prohibited by law, if there is liability found on the part of company, it will be limited to the amount paid for the products and/or services, and under no circumstances will there be consequential or punitive damages.
                </p>

                {/* Termination */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  16. Termination
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  We may terminate or suspend your account and bar access to Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of Terms.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  If you wish to terminate your account, you may simply discontinue using Service.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  All provisions of Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
                </p>

                {/* Governing Law */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  17. Governing Law
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  These Terms shall be governed and construed in accordance with the laws of Kenya, which governing law applies to agreement without regard to its conflict of law provisions.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service and supersede and replace any prior agreements we might have had between us regarding Service.
                </p>

                {/* Amendments to Terms */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  18. Amendments to Terms
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  We may amend Terms at any time by posting the amended terms on this site. It is your responsibility to review these Terms periodically.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Your continued use of the Platform following the posting of revised Terms means that you accept and agree to the changes. You are expected to check this page frequently so you are aware of any changes, as they are binding on you.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use Service.
                </p>

                {/* Waiver And Severability */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  19. Waiver And Severability
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  No waiver by Company of any term or condition set forth in Terms shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition, and any failure of Company to assert a right or provision under Terms shall not constitute a waiver of such right or provision.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  If any provision of Terms is held by a court or other tribunal of competent jurisdiction to be invalid, illegal or unenforceable for any reason, such provision shall be eliminated or limited to the minimum extent such that the remaining provisions of Terms will continue in full force and effect.
                </p>

                {/* Acknowledgement */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  20. Acknowledgement
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-semibold">
                  BY USING SERVICE OR OTHER SERVICES PROVIDED BY US, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.
                </p>

                {/* Contact Us */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline mt-8 sm:mt-10 mb-4">
                  21. Contact Us
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Please send your feedback, comments, requests for technical support by email: <a href="mailto:info@tokea.com" className="text-accent hover:underline">info@tokea.com</a>.
                </p>

                <div className="mt-8 sm:mt-10 p-4 sm:p-6 bg-accent/10 rounded-lg border-2 border-accent/20">
                  <p className="text-sm sm:text-base font-semibold mb-2">
                    Questions?
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    If you have any questions about these Terms and Conditions, please contact us at <a href="mailto:info@tokea.com" className="text-accent hover:underline">info@tokea.com</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

