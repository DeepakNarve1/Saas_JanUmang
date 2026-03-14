import { useState } from "react";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { toast } from "react-toastify";
import { ShieldCheck, QrCode, Smartphone, XCircle } from "lucide-react";
import axios from "@app/utils/axios";
import { handleError } from "@app/utils/errorHandler";
import { useAppSelector, useAppDispatch } from "@app/store/store";
import { setCurrentUser } from "@store/reducers/auth";

const MFATab = ({ isActive }: { isActive: boolean }) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const dispatch = useAppDispatch();
  const [setupMode, setSetupMode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/auth/mfa/generate");
      setQrCodeUrl(res.data.data.qrCode);
      setMfaSecret(res.data.data.secret);
      setSetupMode(true);
    } catch (error) {
      handleError(error, "Failed to generate MFA setup");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    try {
      setLoading(true);
      await axios.post("/auth/mfa/verify-setup", { code: mfaCode });
      if (currentUser) {
        dispatch(setCurrentUser({ ...currentUser, mfaEnabled: true }));
      }
      toast.success("MFA has been successfully enabled!");
      setSetupMode(false);
      setMfaCode("");
    } catch (error) {
      handleError(error, "Invalid authenticator code");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    if (!window.confirm("Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.")) return;
    try {
      setLoading(true);
      await axios.post("/auth/mfa/disable", { code: mfaCode });
      if (currentUser) {
        dispatch(setCurrentUser({ ...currentUser, mfaEnabled: false }));
      }
      toast.success("MFA has been successfully disabled.");
      setMfaCode("");
    } catch (error) {
      handleError(error, "Invalid authenticator code");
    } finally {
      setLoading(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-gray-800 mb-6">
        <ShieldCheck className="w-4 h-4 text-[#368F8B]" />
        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Two-Factor Authentication
        </h4>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50/50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full shrink-0 ${currentUser?.mfaEnabled ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'}`}>
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-1">
                Authenticator App
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                Use an authenticator application like Google Authenticator, Authy, or Microsoft Authenticator to scan a QR code and generate secure login codes.
              </p>
              
              {!currentUser?.mfaEnabled && !setupMode && (
                <Button 
                  onClick={handleGenerate} 
                  disabled={loading}
                  className="bg-[#368F8B] hover:bg-[#2d7a76] text-white font-bold rounded-xl shadow-lg shadow-[#368F8B]/20"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Enable Two-Factor Authentication
                </Button>
              )}

              {setupMode && !currentUser?.mfaEnabled && (
                <div className="space-y-6 mt-6 animate-in fade-in zoom-in-95 duration-300 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Scan this QR Code</p>
                    <div className="bg-white p-4 rounded-xl inline-block shadow-sm border border-gray-100">
                      <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48" />
                    </div>
                    <p className="text-xs text-gray-500 mt-4 max-w-sm mx-auto">
                      Or enter this secret key manually into your app: <br/>
                      <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded mt-1 inline-block select-all font-mono font-bold text-gray-800 dark:text-gray-300 tracking-widest">{mfaSecret}</code>
                    </p>
                  </div>

                  <form onSubmit={handleVerifySetup} className="space-y-4 max-w-sm mx-auto">
                    <div>
                         <Input
                          placeholder="Enter 6-digit code"
                          value={mfaCode}
                          maxLength={6}
                          onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                          className="text-center tracking-widest text-lg h-12 rounded-xl focus-visible:ring-[#368F8B]"
                        />
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setSetupMode(false)} className="flex-1 rounded-xl">Cancel</Button>
                      <Button type="submit" disabled={loading || mfaCode.length !== 6} className="flex-1 bg-[#368F8B] hover:bg-[#2d7a76] rounded-xl text-white">Verify & Enable</Button>
                    </div>
                  </form>
                </div>
              )}

              {currentUser?.mfaEnabled && (
                <div className="mt-4">
                  <div className="inline-flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-3 py-1 rounded-full mb-6">
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    Active & Protected
                  </div>

                  <form onSubmit={handleDisable} className="space-y-4 max-w-sm">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Disable Two-Factor Auth</p>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Current 6-digit code"
                        value={mfaCode}
                        maxLength={6}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        className="tracking-widest rounded-xl focus-visible:ring-red-500"
                      />
                      <Button type="submit" disabled={loading || mfaCode.length !== 6} variant="outline" className="shrink-0 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:text-red-500">
                        <XCircle className="w-4 h-4 mr-2" />
                        Disable MFA
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFATab;
