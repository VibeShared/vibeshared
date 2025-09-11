"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    newsletter: true,
    security: true,
  });

  // Initialize form data with session data
  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || "",
        email: session.user.email || "",
        bio: "",
      });
    }
  }, [session]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update session if needed
      if (profileData.name !== session?.user?.name) {
        await update({ name: profileData.name });
      }
      
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to change password. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setMessage({ type: "success", text: "Notification preferences saved!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save preferences." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">Settings</h1>
            <button 
              onClick={() => router.back()}
              className="btn btn-outline-secondary"
            >
              <i className="bi bi-arrow-left me-2"></i>Back
            </button>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type === "success" ? "success" : "danger"} alert-dismissible fade show`} role="alert">
              {message.text}
              <button type="button" className="btn-close" onClick={() => setMessage({ type: "", text: "" })}></button>
            </div>
          )}

          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="row g-0">
                {/* Sidebar Navigation */}
                <div className="col-md-3 border-end">
                  <div className="list-group list-group-flush rounded-0">
                    <button
                      className={`list-group-item list-group-item-action border-0 py-3 ${activeTab === "profile" ? "active" : ""}`}
                      onClick={() => setActiveTab("profile")}
                    >
                      <i className="bi bi-person me-2"></i>Profile
                    </button>
                    <button
                      className={`list-group-item list-group-item-action border-0 py-3 ${activeTab === "security" ? "active" : ""}`}
                      onClick={() => setActiveTab("security")}
                    >
                      <i className="bi bi-shield-lock me-2"></i>Security
                    </button>
                    <button
                      className={`list-group-item list-group-item-action border-0 py-3 ${activeTab === "notifications" ? "active" : ""}`}
                      onClick={() => setActiveTab("notifications")}
                    >
                      <i className="bi bi-bell me-2"></i>Notifications
                    </button>
                    <button
                      className={`list-group-item list-group-item-action border-0 py-3 ${activeTab === "privacy" ? "active" : ""}`}
                      onClick={() => setActiveTab("privacy")}
                    >
                      <i className="bi bi-lock me-2"></i>Privacy
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="col-md-9">
                  <div className="p-4">
                    {/* Profile Tab */}
                    {activeTab === "profile" && (
                      <div>
                        <h2 className="h5 mb-4">Profile Information</h2>
                        <form onSubmit={handleProfileUpdate}>
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label htmlFor="name" className="form-label">Full Name</label>
                              <input
                                type="text"
                                className="form-control"
                                id="name"
                                value={profileData.name}
                                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="email" className="form-label">Email Address</label>
                              <input
                                type="email"
                                className="form-control"
                                id="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                required
                                disabled
                              />
                              <div className="form-text">Email cannot be changed</div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <label htmlFor="bio" className="form-label">Bio</label>
                            <textarea
                              className="form-control"
                              id="bio"
                              rows={4}
                              value={profileData.bio}
                              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                              placeholder="Tell us a little about yourself..."
                            ></textarea>
                          </div>
                          
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Saving...
                              </>
                            ) : (
                              "Update Profile"
                            )}
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === "security" && (
                      <div>
                        <h2 className="h5 mb-4">Security Settings</h2>
                        
                        <div className="mb-4">
                          <h3 className="h6 mb-3">Change Password</h3>
                          <form onSubmit={handlePasswordChange}>
                            <div className="mb-3">
                              <label htmlFor="currentPassword" className="form-label">Current Password</label>
                              <input
                                type="password"
                                className="form-control"
                                id="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                required
                              />
                            </div>
                            
                            <div className="mb-3">
                              <label htmlFor="newPassword" className="form-label">New Password</label>
                              <input
                                type="password"
                                className="form-control"
                                id="newPassword"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                required
                                minLength={6}
                              />
                            </div>
                            
                            <div className="mb-3">
                              <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                              <input
                                type="password"
                                className="form-control"
                                id="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                required
                              />
                            </div>
                            
                            <button 
                              type="submit" 
                              className="btn btn-primary"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Updating...
                                </>
                              ) : (
                                "Change Password"
                              )}
                            </button>
                          </form>
                        </div>
                        
                        <div className="border-top pt-4">
                          <h3 className="h6 mb-3">Two-Factor Authentication</h3>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <p className="mb-1">2FA is currently disabled</p>
                              <p className="text-muted small mb-0">Add an extra layer of security to your account</p>
                            </div>
                            <button className="btn btn-outline-primary">Enable 2FA</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === "notifications" && (
                      <div>
                        <h2 className="h5 mb-4">Notification Preferences</h2>
                        
                        <div className="mb-4">
                          <div className="form-check form-switch mb-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="emailNotifications"
                              checked={notifications.email}
                              onChange={() => handleNotificationChange("email")}
                            />
                            <label className="form-check-label" htmlFor="emailNotifications">
                              Email Notifications
                            </label>
                          </div>
                          
                          <div className="form-check form-switch mb-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="pushNotifications"
                              checked={notifications.push}
                              onChange={() => handleNotificationChange("push")}
                            />
                            <label className="form-check-label" htmlFor="pushNotifications">
                              Push Notifications
                            </label>
                          </div>
                          
                          <div className="form-check form-switch mb-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="newsletter"
                              checked={notifications.newsletter}
                              onChange={() => handleNotificationChange("newsletter")}
                            />
                            <label className="form-check-label" htmlFor="newsletter">
                              Newsletter
                            </label>
                          </div>
                          
                          <div className="form-check form-switch mb-4">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="securityAlerts"
                              checked={notifications.security}
                              onChange={() => handleNotificationChange("security")}
                            />
                            <label className="form-check-label" htmlFor="securityAlerts">
                              Security Alerts
                            </label>
                          </div>
                          
                          <button 
                            className="btn btn-primary"
                            onClick={handleSaveNotifications}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Saving...
                              </>
                            ) : (
                              "Save Preferences"
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Privacy Tab */}
                    {activeTab === "privacy" && (
                      <div>
                        <h2 className="h5 mb-4">Privacy Settings</h2>
                        
                        <div className="mb-4">
                          <div className="form-check form-switch mb-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="dataCollection"
                              defaultChecked
                            />
                            <label className="form-check-label" htmlFor="dataCollection">
                              Allow data collection to improve service
                            </label>
                          </div>
                          
                          <div className="form-check form-switch mb-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="personalizedAds"
                              defaultChecked
                            />
                            <label className="form-check-label" htmlFor="personalizedAds">
                              Personalized advertising
                            </label>
                          </div>
                          
                          <div className="form-check form-switch mb-4">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="searchVisibility"
                            />
                            <label className="form-check-label" htmlFor="searchVisibility">
                              Make my profile discoverable in search
                            </label>
                          </div>
                          
                          <button className="btn btn-primary">Save Privacy Settings</button>
                        </div>
                        
                        <div className="border-top pt-4">
                          <h3 className="h6 mb-3">Data Management</h3>
                          <div className="d-grid gap-2 d-md-block">
                            <button className="btn btn-outline-secondary me-2 mb-2">
                              Export My Data
                            </button>
                            <button className="btn btn-outline-danger mb-2">
                              Delete Account
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}