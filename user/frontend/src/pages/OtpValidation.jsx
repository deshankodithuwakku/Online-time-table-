import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaShieldAlt, FaEnvelope, FaArrowLeft, FaCheck } from "react-icons/fa";

const ValidateOTP = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailFromQuery = queryParams.get("email");
    if (emailFromQuery) {
      setEmail(decodeURIComponent(emailFromQuery));
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      toast.error("Both email and OTP are required");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8080/api/user/validateotp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to validate OTP");
      }

      toast.success(data.message || "OTP validated successfully!");
      navigate(`/resetpassword?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center relative">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-blue-200 transition"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h2 className="text-2xl font-bold text-white">
              Verify Your Identity
            </h2>
            <p className="text-blue-100 mt-1">
              Enter the OTP sent to your email
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field (hidden but shown for reference) */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="hidden"
                    value={email}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* OTP Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaShieldAlt className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Verify OTP
                  </>
                )}
              </button>
            </form>

            {/* Additional Help */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>OTP Validate Only 3 Minuts Before That Enter Code</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidateOTP;
