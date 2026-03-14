'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageCircle, Send, HelpCircle, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeading from '@/components/ui/SectionHeading';
import FloatingOrbs from '@/components/ui/FloatingOrbs';

const channels = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'For general inquiries and technical support',
    link: 'mailto:support@traderx.app',
    linkText: 'support@traderx.app',
    color: '#6366F1',
  },
  {
    icon: Mail,
    title: 'Sales & Partnerships',
    description: 'Enterprise plans, custom integrations, and partnerships',
    link: 'mailto:sales@traderx.app',
    linkText: 'sales@traderx.app',
    color: '#8B5CF6',
  },
  {
    icon: MessageCircle,
    title: 'Discord Community',
    description: 'Live community support and feature discussions',
    link: 'https://discord.gg/traderx',
    linkText: 'Join Discord →',
    external: true,
    color: '#5865F2',
  },
  {
    icon: Send,
    title: 'Telegram Channel',
    description: 'Product announcements and signal updates',
    link: 'https://t.me/traderx',
    linkText: 'Open Telegram →',
    external: true,
    color: '#0EA5E9',
  },
];

const subjects = [
  { value: '', label: 'Select a topic' },
  { value: 'support', label: '🔧 Technical Support' },
  { value: 'billing', label: '💳 Billing & Subscription' },
  { value: 'feature', label: '✨ Feature Request' },
  { value: 'bug', label: '🐛 Bug Report' },
  { value: 'enterprise', label: '🏢 Enterprise Inquiry' },
  { value: 'other', label: '📝 Other' },
];

export default function ContactClient() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <FloatingOrbs />

      {/* Hero */}
      <section style={{ padding: '100px 24px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <SectionHeading
          badge="Get in Touch"
          title="We'd Love to Hear From You"
          subtitle="Have a question, feature request, or need help? Our team typically responds within 24 hours."
        />
      </section>

      {/* Contact Channels */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 60px', position: 'relative', zIndex: 1 }}>
        <StaggerContainer>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {channels.map((channel, i) => (
              <StaggerItem key={i}>
                <a
                  href={channel.link}
                  target={channel.external ? '_blank' : undefined}
                  rel={channel.external ? 'noopener noreferrer' : undefined}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <GlassCard hover glow glowColor={channel.color} padding="24px">
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: `${channel.color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 16,
                    }}>
                      <channel.icon size={22} color={channel.color} />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 6 }}>
                      {channel.title}
                    </h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 12, lineHeight: 1.5 }}>
                      {channel.description}
                    </p>
                    <span style={{ fontSize: 13, color: channel.color, fontWeight: 600 }}>
                      {channel.linkText}
                    </span>
                  </GlassCard>
                </a>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </section>

      {/* Contact Form */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 100px', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <GlassCard padding="0">
            <div style={{
              padding: '32px 32px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              paddingBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(99,102,241,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <HelpCircle size={18} color="#A5B4FC" />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Send a Message</h2>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Fill out the form and we&apos;ll get back to you as soon as possible.
              </p>
            </div>

            <div style={{ padding: 32 }}>
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    style={{ textAlign: 'center', padding: '40px 20px' }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
                      style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'rgba(16,185,129,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                      }}
                    >
                      <CheckCircle size={32} color="#10B981" />
                    </motion.div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Message Sent!</h3>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
                      Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                      style={{
                        padding: '10px 24px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                        background: 'transparent', color: 'white', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Send Another Message
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                  >
                    {/* Name */}
                    <FormField
                      label="Name"
                      focused={focusedField === 'name'}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                    >
                      <input
                        type="text"
                        required
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={inputStyle(focusedField === 'name')}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </FormField>

                    {/* Email */}
                    <FormField
                      label="Email"
                      focused={focusedField === 'email'}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    >
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={inputStyle(focusedField === 'email')}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </FormField>

                    {/* Subject */}
                    <FormField
                      label="Subject"
                      focused={focusedField === 'subject'}
                      onFocus={() => setFocusedField('subject')}
                      onBlur={() => setFocusedField(null)}
                    >
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        style={inputStyle(focusedField === 'subject')}
                        onFocus={() => setFocusedField('subject')}
                        onBlur={() => setFocusedField(null)}
                      >
                        {subjects.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </FormField>

                    {/* Message */}
                    <FormField
                      label="Message"
                      focused={focusedField === 'message'}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                    >
                      <textarea
                        required
                        rows={5}
                        placeholder="Describe your question or issue..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        style={{ ...inputStyle(focusedField === 'message'), resize: 'vertical' }}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </FormField>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(99,102,241,0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                        fontSize: 15, fontWeight: 700, color: 'white', cursor: 'pointer',
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        marginTop: 8,
                      }}
                    >
                      Send Message <ArrowRight size={16} />
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </FadeIn>

        {/* Response Time Note */}
        <FadeIn delay={0.2}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 24, padding: '12px 20px', borderRadius: 12,
            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)',
          }}>
            <Zap size={14} color="#A5B4FC" />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              Average response time: <strong style={{ color: '#A5B4FC' }}>under 4 hours</strong> during business days
            </span>
          </div>
        </FadeIn>
      </section>

      <style>{`
        select option {
          background: #1a1a2e;
          color: white;
        }
      `}</style>
    </div>
  );
}

function FormField({ label, children, focused }) {
  return (
    <motion.div
      style={{ marginBottom: 20 }}
      animate={{ scale: focused ? 1.01 : 1 }}
      transition={{ duration: 0.15 }}
    >
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 600,
        color: focused ? '#A5B4FC' : 'rgba(255,255,255,0.45)',
        marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px',
        transition: 'color 0.15s',
      }}>
        {label}
      </label>
      {children}
    </motion.div>
  );
}

function inputStyle(focused) {
  return {
    width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14,
    background: focused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${focused ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
    color: 'white', outline: 'none', fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  };
}
