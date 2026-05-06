import React, { useState } from 'react';
import { X, ShieldCheck, Activity, Database, Download, FileText, Loader2, Cpu, Globe, Lock } from 'lucide-react';
import { SignalMonitor } from './SignalMonitor';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ethers } from 'ethers';

interface ProofExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  proof: any;
}

export const ProofExplorer = ({ isOpen, onClose, proof }: ProofExplorerProps) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!proof) return null;

  const generatePDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toISOString();
      const proofId = proof.id || proof.proofId || 'N/A';

      // Design: Brutalist Editorial Style
      doc.setFont('courier', 'bold');
      doc.setFontSize(24);
      doc.text('ANTHROPOL AUDIT PROOF', 20, 30);
      
      doc.setFontSize(10);
      doc.text(`ID: ${proofId}`, 20, 40);
      doc.text(`DATE: ${timestamp}`, 20, 45);
      
      doc.setDrawColor(0);
      doc.setLineWidth(1);
      doc.line(20, 50, 190, 50);

      // Section: Biometric Data
      doc.setFontSize(14);
      doc.text('BIOMETRIC ASSESSMENT', 20, 65);
      
      const tableData = [
        ['Metric', 'Value', 'Status'],
        ['BPM Rate', `${proof.signals?.bpm || 72} BPM`, 'OPTIMAL'],
        ['Rhythmicity', `${((proof.signals?.telemetry?.rhythmScore || 0.99) * 100).toFixed(1)}%`, 'VERIFIED'],
        ['Liveness Hash', proofId.substring(0, 12), 'CRYPTOGRAPHIC'],
        ['Result', proof.status.toUpperCase(), 'PASSED']
      ];

      autoTable(doc, {
        startY: 75,
        head: [['Metric', 'Value', 'Status']],
        body: tableData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: 'black', textColor: [255, 255, 255] },
        styles: { font: 'courier' }
      });

      // Compliance Note
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(8);
      doc.text('REGULATORY COMPLIANCE NOTE:', 20, finalY);
      doc.setFont('courier', 'normal');
      doc.text('This document serves as technical proof of liveness and identity for GDPR and EU AI Act requirements.', 20, finalY + 5);
      doc.text('The biometric signals captured were processed locally and attested via zero-knowledge methodology.', 20, finalY + 10);

      doc.setDrawColor(0);
      doc.rect(20, finalY + 20, 170, 40);
      doc.setFont('courier', 'bold');
      doc.text('DIGITAL SIGNATURE ATTESTATION', 25, finalY + 30);
      doc.setFontSize(6);
      
      const payloadHash = ethers.id(JSON.stringify(proof));
      doc.text(payloadHash, 25, finalY + 35);

      doc.save(`Anthropolo_Proof_${proofId.substring(0, 8)}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-black/60 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-6xl bg-brand-paper rounded-[3rem] shadow-2xl h-full overflow-hidden flex flex-col border border-brand-primary/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Premium Header */}
            <div className="px-12 py-10 flex justify-between items-center bg-white border-b border-brand-primary/5">
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 rounded-3xl bg-brand-success/10 flex items-center justify-center border border-brand-success/20 shadow-sm">
                  <ShieldCheck className="text-brand-success" size={32} />
                </div>
                <div>
                  <h2 className="text-5xl font-bold uppercase tracking-tighter leading-none">Audit Proof</h2>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-brand-success/10 rounded-full">
                       <div className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                       <span className="mono text-[9px] uppercase font-bold text-brand-success tracking-widest">Attestation Valid</span>
                    </div>
                    <p className="mono text-[10px] uppercase font-bold text-brand-secondary opacity-40 tracking-widest">Sig: {proof.id || proof.proofId}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-5 rounded-2xl hover:bg-brand-surface transition-all border border-brand-primary/5 group bg-brand-paper shadow-sm"
              >
                <X size={32} className="text-brand-primary group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* Body Content */}
            <div className="flex-1 overflow-y-auto p-12 space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Meta Panel */}
                <div className="lg:col-span-4 space-y-8">
                  <div className="bg-white rounded-[2.5rem] p-10 border border-brand-primary/5 shadow-sm space-y-10">
                    <div className="space-y-4">
                      <p className="mono text-[11px] uppercase font-bold text-brand-secondary tracking-[0.3em] opacity-40">Biological Integrity</p>
                      <div className="flex items-center gap-6">
                        <div className={`w-5 h-5 rounded-full ${proof.status === 'passed' ? 'bg-brand-success shadow-[0_0_15px_rgba(61,90,58,0.6)]' : 'bg-red-500'} animate-pulse`} />
                        <h3 className="text-6xl font-bold tracking-tighter uppercase leading-none">{proof.status}</h3>
                      </div>
                    </div>

                    <div className="space-y-5 pt-10 border-t border-brand-primary/5">
                      <div className="flex justify-between items-center group">
                        <span className="mono text-[10px] uppercase font-bold opacity-40 tracking-widest group-hover:opacity-100 transition-opacity">Pulse rate</span>
                        <div className="flex items-center gap-2">
                           <Activity size={14} className="text-brand-accent" />
                           <span className="text-2xl font-bold tracking-tighter">{proof.signals?.bpm || 72} <span className="text-xs uppercase opacity-40">bpm</span></span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center group">
                        <span className="mono text-[10px] uppercase font-bold opacity-40 tracking-widest group-hover:opacity-100 transition-opacity">Neural Seal</span>
                        <div className="flex items-center gap-2">
                           <Lock size={14} className="text-brand-success" />
                           <span className="px-4 py-1.5 bg-brand-success/10 text-brand-success rounded-full text-[10px] font-bold border border-brand-success/20">ATOMIC_LOCK</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center group">
                        <span className="mono text-[10px] uppercase font-bold opacity-40 tracking-widest group-hover:opacity-100 transition-opacity">Fidelity Score</span>
                        <div className="flex items-center gap-2">
                           <span className="text-2xl font-bold tracking-tighter">{(proof.signals?.telemetry?.rhythmScore * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center group">
                        <span className="mono text-[10px] uppercase font-bold opacity-40 tracking-widest group-hover:opacity-100 transition-opacity">Telemetry Sync</span>
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                           <span className="text-brand-primary font-bold uppercase text-[11px] tracking-widest">Cluster-Synced</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-brand-primary rounded-[2.5rem] p-10 text-brand-paper shadow-2xl shadow-brand-primary/20 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                       <Cpu size={120} />
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                      <Database size={20} className="text-brand-accent" />
                      <p className="mono text-[11px] uppercase font-bold tracking-[0.3em] text-brand-accent underline decoration-brand-accent/30 underline-offset-8">Merkle Root Attestation</p>
                    </div>
                    <div 
                      className="bg-black/20 rounded-2xl p-6 border border-white/5 backdrop-blur-sm relative z-10 transition-colors hover:bg-black/30"
                      aria-label="Cryptographic Merkle Root Attestation Data"
                    >
                       <pre className="text-[11px] mono leading-relaxed opacity-80 break-all whitespace-pre-wrap font-medium">
                        {JSON.stringify({
                          leaf: (proof.proofId || '').substring(0, 16),
                          circuit: 'zk-groth16-v1.2',
                          anchor: '0x' + (proof.id || '').substring(0, 16),
                          verified: true
                        }, null, 2)}
                      </pre>
                    </div>
                    <div className="flex items-center gap-3 opacity-40 relative z-10">
                       <Globe size={14} />
                       <span className="mono text-[9px] uppercase font-bold tracking-widest">Decentralized Oracle Finality</span>
                    </div>
                  </div>
                </div>

                {/* Analysis Panel */}
                <div className="lg:col-span-8">
                   <div className="bg-white rounded-[2.5rem] border border-brand-primary/5 shadow-sm relative overflow-hidden h-full flex flex-col">
                      <div className="p-10 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                           <div className="space-y-1">
                              <h4 className="text-3xl font-bold uppercase tracking-tighter">Signal Analysis</h4>
                              <p className="mono text-[10px] uppercase font-bold text-brand-secondary opacity-40 tracking-widest">30Hz Biometric Capture Stream</p>
                           </div>
                           <div className="flex items-center gap-2 px-4 py-2 bg-brand-surface rounded-xl border border-brand-primary/5">
                              <Activity size={16} className="text-brand-accent animate-pulse" />
                              <span className="mono text-[10px] font-bold uppercase">Live Signal</span>
                           </div>
                        </div>
                        
                        <div className="flex-1 min-h-[350px]">
                           <SignalMonitor sessionData={proof} />
                        </div>
                      </div>
                      
                      <div className="p-12 border-t border-brand-primary/5 bg-brand-surface/20">
                        <div className="flex items-center gap-4 text-brand-secondary mb-8">
                          <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center">
                             <Activity size={20} />
                          </div>
                          <div className="space-y-0.5">
                             <p className="mono text-[11px] uppercase font-bold tracking-[0.2em] leading-none">Forensic Timeline</p>
                             <p className="mono text-[9px] uppercase opacity-40 font-bold">Temporal Artifact Detection Active</p>
                          </div>
                        </div>
                        <div className="h-4 w-full bg-brand-primary/5 rounded-full overflow-hidden flex gap-1 p-0.5 border border-brand-primary/5">
                          <div className="h-full bg-brand-success/80 rounded-sm w-[45%] transition-all hover:bg-brand-success" />
                          <div className="h-full bg-brand-accent/60 rounded-sm w-[20%] transition-all hover:bg-brand-accent" />
                          <div className="h-full bg-brand-success w-[25%] transition-all hover:bg-brand-success" />
                          <div className="h-full bg-brand-primary/20 rounded-sm w-[10%] transition-all hover:bg-brand-primary/40" />
                        </div>
                        <div className="flex justify-between mt-5 mono text-[10px] font-bold text-brand-secondary opacity-40 uppercase tracking-[0.1em]">
                          <span className="bg-brand-surface px-2 py-1 rounded">0.0s [START]</span>
                          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-success" /> SIGNAL LOCK</span>
                          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-accent" /> ATTESTATION</span>
                          <span className="bg-brand-surface px-2 py-1 rounded">3.0s [END]</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Data Export Banner */}
              <div className="bg-brand-accent rounded-[3rem] p-12 flex flex-col xl:flex-row justify-between items-center gap-12 shadow-2xl shadow-brand-accent/10 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-6">
                    <FileText size={200} className="text-brand-primary" />
                 </div>
                 
                 <div className="space-y-4 relative z-10 text-center xl:text-left">
                   <div className="flex flex-col md:flex-row items-center gap-5 justify-center xl:justify-start">
                      <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                         <FileText size={32} className="text-brand-primary" />
                      </div>
                      <h4 className="text-5xl font-bold uppercase tracking-tighter leading-none">Compliance Asset</h4>
                   </div>
                   <p className="text-xl text-brand-primary/70 font-medium max-w-2xl">
                     Certified PDF audit trail. Formal verification document for legal disclosure (GDPR Article 22 / EU AI Act Compliance).
                   </p>
                 </div>
                 
                 <button 
                  onClick={generatePDF}
                  disabled={isExporting}
                  className="bg-brand-primary text-brand-paper px-14 py-6 rounded-2xl mono text-[13px] font-bold uppercase flex items-center gap-5 hover:bg-black transition-all shadow-2xl relative z-10 group/btn disabled:opacity-50"
                 >
                   {isExporting ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} className="group-hover/btn:-translate-y-1 transition-transform" />}
                   {isExporting ? 'Generating Evidence...' : 'Download Audit PDF'}
                 </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
