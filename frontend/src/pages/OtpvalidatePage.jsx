import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ValidateOTP = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailFromQuery = queryParams.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      setMessage("Both email and OTP are required.");
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

      setMessage(data.message);
      toast.success(data.message);
      navigate(`/resetpassword?email=${encodeURIComponent(email)}`);
    } catch (error) {
      setMessage(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Validate OTP</h2>

        {/* {message && (
          <div
            className={`mb-4 p-2 text-center rounded-md ${
              message.includes("success")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )} */}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="hidden"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <input
              type="number"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              placeholder="Enter OTP"
            />
          </div>

          <button
            type="submit"
            className={`w-full p-2 bg-blue-500 text-white rounded-md ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Validating..." : "Validate OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ValidateOTP;
