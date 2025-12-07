"use client"

import React, { useState } from 'react';
import { Mail, Send, AlertCircle, CheckCircle, Loader2, Scale, FileText, Users } from 'lucide-react';

export default function LawFirmEmailSender() {
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const parseRecipients = (text) => {
    const emails = text
      .split(/[,;\n\s]+/)
      .map(email => email.trim())
      .filter(email => email !== '');
    return emails;
  };

  const getRecipientCount = () => {
    const emails = parseRecipients(recipients);
    return emails.length;
  };

 const API_URL = process.env.NEXT_PUBLIC_API_URL;

const handleSend = async () => {
  const validRecipients = parseRecipients(recipients);
  
  if (validRecipients.length === 0) {
    setResult({ success: false, message: 'Please add at least one recipient' });
    return;
  }

  if (!subject.trim()) {
    setResult({ success: false, message: 'Please add a subject' });
    return;
  }

  if (!message.trim()) {
    setResult({ success: false, message: 'Please add a message' });
    return;
  }

  setSending(true);
  setResult(null);

  try {
    console.log('Sending to:', `${API_URL}/api/send-bulk-email`); // Debug log
    
    const response = await fetch(`${API_URL}/api/send-bulk-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipients: validRecipients,
        subject,
        message,
      }),
    });

      const data = await response.json();

      if (response.ok) {
        setResult({ 
          success: true, 
          message: `Successfully sent ${data.successful} email(s). ${data.failed > 0 ? `Failed: ${data.failed}` : ''}` 
        });
        setRecipients('');
        setSubject('');
        setMessage('');
      } else {
        setResult({ success: false, message: data.message || 'Failed to send emails' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Error connecting to server. Make sure backend is running on port 5000.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-600 rounded-lg">
                <Scale className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold tracking-tight">Legal Communications</h1>
                <p className="text-slate-300 text-sm mt-1">Professional Client Correspondence System</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm">
              <button className="flex items-center gap-2 hover:text-amber-500 transition-colors">
                <FileText className="w-4 h-4" />
                <span>Documents</span>
              </button>
              <button className="flex items-center gap-2 hover:text-amber-500 transition-colors">
                <Users className="w-4 h-4" />
                <span>Clients</span>
              </button>
              <button className="flex items-center gap-2 hover:text-amber-500 transition-colors">
                <Mail className="w-4 h-4" />
                <span>Messages</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
              <div className="w-12 h-1 bg-amber-600 mb-4"></div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Client Communication</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Send professional correspondence to multiple clients simultaneously while maintaining the highest standards of legal communication.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-700 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Add Recipients</h4>
                    <p className="text-slate-600 text-xs mt-1">Enter client email addresses</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-700 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Compose Message</h4>
                    <p className="text-slate-600 text-xs mt-1">Draft your legal correspondence</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-700 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Send Securely</h4>
                    <p className="text-slate-600 text-xs mt-1">Deliver to all recipients</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-slate-900 text-white rounded-lg shadow-sm p-6">
              <h3 className="font-serif font-bold text-lg mb-4">Current Session</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400 text-sm">Recipients</span>
                  <span className="font-bold text-amber-500">{getRecipientCount()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Status</span>
                  <span className="text-xs px-2 py-1 bg-green-900/50 text-green-400 rounded">Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
              <div className="border-b border-stone-200 bg-stone-50 px-8 py-6">
                <h3 className="text-xl font-serif font-bold text-slate-900">Compose Correspondence</h3>
                <p className="text-slate-600 text-sm mt-1">All fields are required for legal documentation</p>
              </div>

              <div className="p-8 space-y-8">
                {/* Recipients */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
                    Client Recipients
                    {getRecipientCount() > 0 && (
                      <span className="ml-3 text-xs font-normal normal-case px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                        {getRecipientCount()} recipient{getRecipientCount() !== 1 ? 's' : ''}
                      </span>
                    )}
                  </label>
                  <textarea
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    placeholder="Enter email addresses separated by comma, semicolon, or new line&#10;&#10;Example:&#10;client1@example.com, client2@example.com&#10;counsel@lawfirm.com"
                    rows={6}
                    className="w-full px-4 py-3 text-slate-700 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent resize-none font-mono text-sm"
                  />
                  <p className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    Supports multiple formats: CSV, Excel paste, or manual entry
                  </p>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Re: Legal Matter Reference"
                    className="w-full px-4 py-3 text-slate-700 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
                    Message Content
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Dear Client,&#10;&#10;Please find enclosed information regarding...&#10;&#10;Best regards,"
                    rows={12}
                    className="w-full px-4 py-3 text-slate-700 bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent resize-none leading-relaxed"
                  />
                  <p className="mt-2 text-xs text-slate-500">Professional legal correspondence formatting applied automatically</p>
                </div>

                {/* Result Message */}
                {result && (
                  <div className={`flex items-start gap-3 p-4 rounded-md border ${
                    result.success 
                      ? 'bg-green-50 text-green-900 border-green-200' 
                      : 'bg-red-50 text-red-900 border-red-200'
                  }`}>
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm font-medium">{result.message}</p>
                  </div>
                )}

                {/* Send Button */}
                <div className="pt-4">
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-md font-semibold text-white transition-all ${
                      sending
                        ? 'bg-stone-400 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending Correspondence...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send to All Recipients</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Technical Setup */}
           
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-600" />
              <span className="font-serif font-bold text-white">Legal Communications System</span>
            </div>
            <p className="text-sm">Confidential & Secure Attorney-Client Communication</p>
          </div>
        </div>
      </footer>
    </div>
  );
}