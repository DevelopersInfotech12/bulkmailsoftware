"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Mail, Send, AlertCircle, CheckCircle, Loader2, Scale, FileText, Users, Bold, Italic, Underline, List, ListOrdered, Palette } from 'lucide-react';

// API Configuration
// local env
// const API_URL = process.env.NEXT_APP_API_URL || 'http://localhost:5000';

// production env
const API_URL = process.env.NEXT_APP_API_URL || 'https://bulkmailsoftwarebackend.vercel.app';


export default function LawFirmEmailSender() {
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#000000');
  const [currentColor, setCurrentColor] = useState('#000000');
  const editorRef = useRef(null);
  const colorPickerRef = useRef(null);

  const colors = [
    '#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff',
    '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff',
    '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff',
    '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2',
    '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466'
  ];

  // Modern approach: Use CSS to style list markers
  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const applyColor = (color) => {
    setCurrentColor(color);
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0) {
      // Apply the color using execCommand
      document.execCommand('foreColor', false, color);
      
      // Find if we're in a list and apply color to the list item
      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;
      if (node.nodeType === 3) node = node.parentElement;
      
      const listItem = node?.closest('li');
      if (listItem) {
        // Apply color directly to list item for marker inheritance
        listItem.style.setProperty('color', color, 'important');
        
        // Also wrap all direct text nodes in spans with the color
        Array.from(listItem.childNodes).forEach(child => {
          if (child.nodeType === 3 && child.textContent.trim()) {
            const span = document.createElement('span');
            span.style.color = color;
            span.textContent = child.textContent;
            listItem.replaceChild(span, child);
          }
        });
      }
    }
    
    setShowColorPicker(false);
    editorRef.current?.focus();
  };

  const applyCustomColor = () => {
    applyColor(customColor);
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setMessage(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== message) {
      editorRef.current.innerHTML = message;
    }
  }, [message]);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

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
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
      } else {
        setResult({ success: false, message: data.message || 'Failed to send emails' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Error connecting to server. Please check your backend deployment.' });
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
                <h1 className="text-3xl font-serif font-bold tracking-tight">Developers Infotech</h1>
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
                  
                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-1 p-2 bg-stone-100 border border-stone-300 rounded-t-md border-b-0">
                    <button
                      type="button"
                      onClick={() => applyFormat('bold')}
                      className="p-2 hover:bg-stone-200 rounded transition-colors"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4 text-slate-700" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('italic')}
                      className="p-2 hover:bg-stone-200 rounded transition-colors"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4 text-slate-700" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('underline')}
                      className="p-2 hover:bg-stone-200 rounded transition-colors"
                      title="Underline"
                    >
                      <Underline className="w-4 h-4 text-slate-700" />
                    </button>
                    <div className="w-px h-6 bg-stone-300 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => applyFormat('insertUnorderedList')}
                      className="p-2 hover:bg-stone-200 rounded transition-colors"
                      title="Bullet List"
                    >
                      <List className="w-4 h-4 text-slate-700" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('insertOrderedList')}
                      className="p-2 hover:bg-stone-200 rounded transition-colors"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-4 h-4 text-slate-700" />
                    </button>
                    <div className="w-px h-6 bg-stone-300 mx-1"></div>
                    <div className="relative" ref={colorPickerRef}>
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="p-2 hover:bg-stone-200 rounded transition-colors flex items-center gap-1"
                        title="Text Color"
                      >
                        <Palette className="w-4 h-4 text-slate-700" />
                        <div className="w-4 h-4 rounded border border-stone-400" style={{ backgroundColor: currentColor }}></div>
                      </button>
                      
                      {showColorPicker && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-stone-300 rounded-lg shadow-lg p-3 z-10">
                          <div className="grid grid-cols-7 gap-1 w-[196px] mb-3">
                            {colors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => applyColor(color)}
                                className="w-6 h-6 rounded border border-stone-300 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                          <div className="border-t border-stone-200 pt-3">
                            <label className="block text-xs font-semibold text-slate-700 mb-2">CUSTOM COLOR</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                className="w-10 h-10 rounded border border-stone-300 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                className="flex-1 px-2 py-1 text-xs border border-stone-300 rounded font-mono"
                                placeholder="#000000"
                              />
                              <button
                                type="button"
                                onClick={applyCustomColor}
                                className="px-3 py-1 bg-amber-600 text-white text-xs font-semibold rounded hover:bg-amber-700 transition-colors"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <style jsx>{`
                    [contenteditable] ul li,
                    [contenteditable] ol li {
                      color: inherit;
                    }
                    [contenteditable] ul li::marker,
                    [contenteditable] ol li::marker {
                      color: inherit;
                    }
                  `}</style>

                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleEditorInput}
                    className="w-full min-h-[300px] px-4 py-3 text-slate-700 bg-stone-50 border border-stone-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent leading-relaxed [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2 [&_li]:mb-1"
                    style={{ whiteSpace: 'pre-wrap' }}
                    suppressContentEditableWarning
                  />
                  <p className="mt-2 text-xs text-slate-500">Use the toolbar to format your legal correspondence</p>
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
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-600" />
              <span className="font-serif font-bold text-white text-2xl">Developers Infotech</span>
            </div>
            <p className="text-sm">Confidential & Secure Attorney-Client Communication</p>
          </div>
        </div>
      </footer>
    </div>
  );
}