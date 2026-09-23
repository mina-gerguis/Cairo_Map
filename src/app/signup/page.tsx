"use client";

import React from "react";
import Link from "next/link";
import { STEP_INFO } from "./constants";
import { useSignupForm } from "./hooks/useSignupForm";
import {
  AuthLayout,
  GlassCard,
  OnboardingSlider,
  StepHeader,
  Step1PersonalInfo,
  Step2Phone,
  Step3LocationAge,
  Step4Avatar,
  Step5Password,
  DobConfirmModal,
} from "./components";
import styles from "./signup.module.css";

export default function SignupPage() {
  const form = useSignupForm();

  // Step 0: Onboarding Welcome Screen
  if (form.step === 0) {
    return <OnboardingSlider onStartSignup={() => form.setStep(1)} />;
  }

  const currentStepInfo = STEP_INFO[form.step];

  const handleFormSubmit = (e: React.FormEvent) => {
    if (form.step === 5) {
      form.handleFinalSubmit(e);
    } else if (form.step === 3) {
      form.handleStep3Submit(e);
    } else {
      e.preventDefault();
      form.nextStep();
    }
  };

  return (
    <AuthLayout>
      <GlassCard>
        {/* Step Navigation & Progress */}
        <StepHeader
          step={form.step}
          onBack={form.prevStep}
          stepInfo={currentStepInfo}
        />

        {/* Global Error Banner */}
        {form.error && (
          <div className={styles.errorBanner}>
            <span>⚠️</span> {form.error}
          </div>
        )}

        {/* Global Success Banner */}
        {form.success && (
          <div className={styles.successBanner}>
            🎉 تم إنشاء حسابك بنجاح! جاري التحويل...
          </div>
        )}

        {/* Main Steps Form */}
        {!form.success && (
          <form onSubmit={handleFormSubmit}>
            {form.step === 1 && (
              <Step1PersonalInfo
                formData={form.formData}
                fieldErrors={form.fieldErrors}
                updateField={form.updateField}
                suggestions={form.suggestions}
                isEmailVerified={form.isEmailVerified}
                emailOtpSent={form.emailOtpSent}
                emailOtp={form.emailOtp}
                emailOtpTimer={form.emailOtpTimer}
                emailOtpLoading={form.emailOtpLoading}
                emailOtpError={form.emailOtpError}
                emailCodeDigits={form.emailCodeDigits}
                emailInputRefs={form.emailInputRefs}
                handleEmailDigitChange={form.handleEmailDigitChange}
                handleEmailKeyDown={form.handleEmailKeyDown}
                handleEmailPaste={form.handleEmailPaste}
                handleSendEmailOtp={form.handleSendEmailOtp}
                handleVerifyEmailOtp={form.handleVerifyEmailOtp}
                isStep1Valid={form.isStep1Valid}
                focusedField={form.focusedField}
                setFocusedField={form.setFocusedField}
              />
            )}

            {form.step === 2 && (
              <Step2Phone
                formData={form.formData}
                fieldErrors={form.fieldErrors}
                updateField={form.updateField}
                isStep2Valid={form.isStep2Valid}
                focusedField={form.focusedField}
                setFocusedField={form.setFocusedField}
              />
            )}

            {form.step === 3 && (
              <Step3LocationAge
                formData={form.formData}
                updateField={form.updateField}
                isStep3Valid={form.isStep3Valid}
                loading={form.loading}
                maxDobDateStr={form.maxDobDateStr}
                focusedField={form.focusedField}
                setFocusedField={form.setFocusedField}
              />
            )}

            {form.step === 4 && (
              <Step4Avatar
                formData={form.formData}
                updateField={form.updateField}
                loading={form.loading}
                handleFileUpload={form.handleFileUpload}
              />
            )}

            {form.step === 5 && (
              <Step5Password
                formData={form.formData}
                updateField={form.updateField}
                showPassword={form.showPassword}
                setShowPassword={form.setShowPassword}
                showConfirmPassword={form.showConfirmPassword}
                setShowConfirmPassword={form.setShowConfirmPassword}
                pwdRules={form.pwdRules}
                isPasswordValid={form.isPasswordValid}
                loading={form.loading}
                focusedField={form.focusedField}
                setFocusedField={form.setFocusedField}
              />
            )}
          </form>
        )}
      </GlassCard>

      {/* Terms and Privacy Policy Note */}
      <p className={styles.footerTerms}>
        بالتسجيل أنت توافق على{" "}
        <Link href="/terms" target="_blank" rel="noopener noreferrer" className={styles.termsLink}>
          الشروط والأحكام
        </Link>
        {" "}و{" "}
        <Link href="/privacy" target="_blank" rel="noopener noreferrer" className={styles.termsLink}>
          سياسة الخصوصية
        </Link>
      </p>

      {/* Date of Birth Confirmation Modal */}
      {form.showDobConfirmModal && (
        <DobConfirmModal
          dob={form.formData.dob}
          onClose={() => form.setShowDobConfirmModal(false)}
          onConfirm={() => {
            form.setShowDobConfirmModal(false);
            form.setStep(4);
          }}
        />
      )}
    </AuthLayout>
  );
}
