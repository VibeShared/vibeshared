"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/componenet/Home/Home.module.css";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicPosts = async () => {
      try {
        const res = await fetch('/api/post/public?limit=6');
        const data = await res.json();
        if (data.posts) {
          setPosts(data.posts);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicPosts();
  }, []);

  return (
    <div className={styles.homepage}>
      {/* 1️⃣ Top Hero Section */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={`row align-items-center ${styles.minVh80}`}>
            <div className="col-lg-6">
              <h1 className={styles.heroTitle}>
                Share Your Vibes with the World <span className={styles.emoji}>🌎</span>
              </h1>
              <p className={styles.heroSubtitle}>
                We support every creator — whether you're just starting out or already creating amazing things. 
                No algorithms holding you back.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link href="/signup" className={styles.primaryButton}>
                  Join Now
                </Link>
                <Link href="/explore" className={styles.secondaryButton}>
                  Browse Public Posts
                </Link>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <div className={styles.heroIllustration}>
                <div className={`${styles.floatingCard} ${styles.card1}`}>
                  <div className="d-flex align-items-center p-2">
                    <div className={`${styles.avatarSm} bg-primary rounded-circle me-2`}></div>
                    <div>
                      <div className="text-sm fw-bold text-dark">@creative_mind</div>
                      <div className="text-xs text-dark">Just shared a new project!</div>
                    </div>
                  </div>
                </div>
                <div className={`${styles.floatingCard} ${styles.card2}`}>
                  <div className="d-flex align-items-center p-2">
                    <div className={`${styles.avatarSm} bg-success rounded-circle me-2`}></div>
                    <div>
                      <div className="text-sm fw-bold text-dark">@traveler_jane</div>
                      <div className="text-xs text-dark">Beautiful sunset at the beach 🌅</div>
                    </div>
                  </div>
                </div>
                <div className={`${styles.floatingCard} ${styles.card3}`}>
                  <div className="d-flex align-items-center p-2">
                    <div className={`${styles.avatarSm} bg-warning rounded-circle me-2`}></div>
                    <div>
                      <div className="text-sm fw-bold text-dark">@foodie_master</div>
                      <div className="text-xs text-dark">Check out my new recipe!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2️⃣ How It Works Section */}
      <section className={styles.section}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>Getting started is simple and takes just a few minutes</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className={styles.card}>
                <div className={`${styles.stepIcon} bg-primary bg-opacity-10 text-primary`}>
                  <i className="bi bi-person-plus fs-1"></i>
                </div>
                <div className="card-body text-center">
                  <h3 className="h4">Create an Account</h3>
                  <p className="text-muted">Free & takes just 10 seconds to sign up and start sharing</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className={styles.card}>
                <div className={`${styles.stepIcon} bg-success bg-opacity-10 text-success`}>
                  <i className="bi bi-chat-square-text fs-1"></i>
                </div>
                <div className="card-body text-center">
                  <h3 className="h4">Post Your Vibe</h3>
                  <p className="text-muted">Share text, images, or videos with your community</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className={styles.card}>
                <div className={`${styles.stepIcon} bg-info bg-opacity-10 text-info`}>
                  <i className="bi bi-people fs-1"></i>
                </div>
                <div className="card-body text-center">
                  <h3 className="h4">Connect with Others</h3>
                  <p className="text-muted">Build your community without algorithms limiting your reach</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3️⃣ Why Choose Us Section */}
      <section className={`${styles.section} ${styles.bgLight}`}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className={styles.sectionTitle}>Why Choose VibeShared</h2>
            <p className={styles.sectionSubtitle}>We're building a different kind of social platform</p>
          </div>
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="d-flex">
                <div className={styles.featureIcon}>
                  <i className="bi bi-filter-circle"></i>
                </div>
                <div>
                  <h3 className={styles.featureTitle}>No Algorithm Bias</h3>
                  <p className={styles.featureText}>Everyone's posts get seen, not just what an algorithm chooses</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="d-flex">
                <div className={styles.featureIcon}>
                  <i className="bi bi-shield-lock"></i>
                </div>
                <div>
                  <h3 className={styles.featureTitle}>Privacy Focused</h3>
                  <p className={styles.featureText}>Your data stays yours. We don't sell your information</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="d-flex">
                <div className={styles.featureIcon}>
                  <i className="bi bi-heart"></i>
                </div>
                <div>
                  <h3 className={styles.featureTitle}>Support for Creators</h3>
                  <p className={styles.featureText}>We promote small voices, not just big influencers</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="d-flex">
                <div className={styles.featureIcon}>
                  <i className="bi bi-lightning"></i>
                </div>
                <div>
                  <h3 className={styles.featureTitle}>Simple & Fun</h3>
                  <p className={styles.featureText}>Clean, easy-to-use interface that focuses on your content</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ Showcase/Preview Feed Section */}
      <section className={styles.section}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className={styles.sectionTitle}>See What People Are Sharing</h2>
            <p className={styles.sectionSubtitle}>A glimpse of the diverse content on our platform</p>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {posts.length > 0 ? (
                posts.map((post: any, index) => (
                  <div key={index} className="col-md-6 col-lg-4">
                    <div className={styles.postCard}>
                      <div className="card-body">
                        <p className="card-text">{post.content?.substring(0, 100)}...</p>
                      </div>
                      <div className={`card-footer ${styles.postFooter} d-flex align-items-center`}>
                        <div className={`${styles.avatarSm} bg-secondary rounded-circle me-2`}></div>
                        <small className="text-muted">Posted by @user{index + 1}</small>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-4">
                  <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                  <p className="text-muted">No public posts available yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 5️⃣ Social Proof Section */}
      <section className={styles.socialProof}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className={styles.sectionTitle}>Join Our Growing Community</h2>
          </div>
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="p-3">
                <h3 className={styles.statNumber}>10,000+</h3>
                <p className="lead">Posts Shared</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <h3 className={styles.statNumber}>5,000+</h3>
                <p className="lead">Active Users</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <h3 className={styles.statNumber}>20+</h3>
                <p className="lead">Countries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6️⃣ Final CTA Section */}
      <section className={styles.finalCta}>
        <div className="container">
          <div className="text-center py-5">
            <h2 className={styles.ctaTitle}>Your Voice Matters</h2>
            <p className={styles.ctaSubtitle}>Start sharing your ideas and connect with like-minded people today</p>
            <Link href="/signup" className={`${styles.primaryButton} ${styles.ctaButton}`}>
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* Bootstrap Icons */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css"
      />
    </div>
  );
}