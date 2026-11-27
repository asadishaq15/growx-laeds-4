import React, { useEffect, useState } from "react";

const TRACKDRIVE_NUMBER = "+18446163653";
const TRAFFIC_SOURCE_ID = "1000";

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District Of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "separated", label: "Separated" },
  { value: "widowed", label: "Widowed" },
];

const GENDER_OPTIONS = [
  { value: "F", label: "Female" },
  { value: "M", label: "Male" },
];

const RESIDENCE_STATUS_OPTIONS = [
  { value: "own", label: "Own" },
  { value: "rent", label: "Rent" },
  { value: "live_with_parents", label: "Live With Parents" },
  { value: "dormitory", label: "Dormitory" },
  { value: "choice_not_llisted", label: "Choice Not Listed" },
];

const INITIAL_FORM = {
  caller_id: "",
  first_name: "",
  last_name: "",
  email: "",
  city: "",
  state: "",
  zip: "",
  dob: "",
  marital_status: "",
  gender: "",
  residence_status: "",
  vehicle1_year: "",
  vehicle1_make: "",
  vehicle1_model: "",
  ip_address: "",
  jornaya_leadid: "",
  optin_timestamp: "",
  age: "",
};

function extractPingId(data) {
  return (
    data?.buyers?.[0]?.ping_id ||
    data?.try_all_buyers_ping_id ||
    data?.try_all_buyers?.ping_id ||
    ""
  );
}

function formatErrors(data, fallback) {
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.join(", ");
  }

  if (data?.errors && typeof data.errors === "object") {
    return Object.entries(data.errors)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
      .join("; ");
  }

  return data?.message || data?.error || data?.status || fallback;
}

export default function GrowxAutoLnForm() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [forwardingNumber, setForwardingNumber] = useState("");

  const isValidPhone = (phone) => /^\+1\d{10}$/.test(String(phone).trim());

  const handlePhoneChange = (e) => {
    let input = e.target.value;
    if (!input.startsWith("+") && input.length > 0) input = "+" + input;
    const value = input.replace(/(?!^\+)\D/g, "").slice(0, 12);
    setFormData((prev) => ({ ...prev, caller_id: value }));
    setError(null);
    setSuccess(false);
  };

  const handleZipChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
    setFormData((prev) => ({ ...prev, zip: value }));
    setError(null);
    setSuccess(false);
  };

  const handleYearChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setFormData((prev) => ({ ...prev, vehicle1_year: value }));
    setError(null);
    setSuccess(false);
  };

  const handleAgeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setFormData((prev) => ({ ...prev, age: value }));
    setError(null);
    setSuccess(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setForwardingNumber("");

    const payload = {
      caller_id: formData.caller_id.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      zip: formData.zip.trim(),
      dob: formData.dob.trim(),
      marital_status: formData.marital_status.trim(),
      gender: formData.gender.trim(),
      residence_status: formData.residence_status.trim(),
      vehicle1_year: formData.vehicle1_year.trim(),
      vehicle1_make: formData.vehicle1_make.trim(),
      vehicle1_model: formData.vehicle1_model.trim(),
      ip_address: formData.ip_address.trim(),
      jornaya_leadid: formData.jornaya_leadid.trim(),
      optin_timestamp: formData.optin_timestamp.trim(),
      age: formData.age.trim(),
    };

    if (!isValidPhone(payload.caller_id)) {
      setError("Please enter a valid US phone number in format: +1XXXXXXXXXX.");
      return;
    }

    if (!payload.first_name || !payload.last_name) {
      setError("First name and last name are required.");
      return;
    }

    if (!payload.email) {
      setError("Email address is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!payload.city) {
      setError("City is required.");
      return;
    }

    if (!payload.state) {
      setError("Please select a state.");
      return;
    }

    if (!/^\d{5}$/.test(payload.zip)) {
      setError("Please enter a valid 5-digit ZIP code.");
      return;
    }

    if (!payload.dob) {
      setError("Date of birth is required.");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.dob)) {
      setError("Date of birth must be in YYYY-MM-DD format.");
      return;
    }

    if (!payload.age) {
      setError("Age is required.");
      return;
    }

    const ageNum = Number(payload.age);
    if (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError("Please enter a valid age.");
      return;
    }

    if (!payload.marital_status) {
      setError("Please select a marital status.");
      return;
    }

    if (!payload.gender) {
      setError("Please select a gender.");
      return;
    }

    if (!payload.residence_status) {
      setError("Please select a residence status.");
      return;
    }

    if (!payload.vehicle1_year) {
      setError("Vehicle year is required.");
      return;
    }

    const year = Number(payload.vehicle1_year);
    if (Number.isNaN(year) || year < 1900 || year > 2200) {
      setError("Vehicle year must be between 1900 and 2200.");
      return;
    }

    if (!payload.vehicle1_make) {
      setError("Vehicle make is required.");
      return;
    }

    if (!payload.vehicle1_model) {
      setError("Vehicle model is required.");
      return;
    }

    if (!payload.ip_address) {
      setError("IP address is required.");
      return;
    }

    if (!payload.jornaya_leadid) {
      setError("Jornaya Lead ID is required.");
      return;
    }

    if (!payload.optin_timestamp) {
      setError("Optin Timestamp is required.");
      return;
    }

    const optinDate = new Date(payload.optin_timestamp);
    if (Number.isNaN(optinDate.getTime())) {
      setError("Please select a valid Optin Timestamp.");
      return;
    }

    const original_lead_submit_date = optinDate.toISOString().replace(/\.\d{3}Z$/, "Z");

    setIsSubmitting(true);

    try {
      const pingParams = new URLSearchParams({
        trackdrive_number: TRACKDRIVE_NUMBER,
        traffic_source_id: TRAFFIC_SOURCE_ID,
        caller_id: payload.caller_id,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        city: payload.city,
        state: payload.state,
        zip: payload.zip,
        dob: payload.dob,
        marital_status: payload.marital_status,
        gender: payload.gender,
        residence_status: payload.residence_status,
        vehicle1_year: payload.vehicle1_year,
        vehicle1_make: payload.vehicle1_make,
        vehicle1_model: payload.vehicle1_model,
        ip_address: payload.ip_address,
        jornaya_leadid: payload.jornaya_leadid,
        original_lead_submit_date,
        age: payload.age,
      });

      const pingResponse = await fetch(`/api/ping23?${pingParams.toString()}`);
      const pingData = await pingResponse.json();

      if (!pingResponse.ok || !pingData.success) {
        throw new Error(formatErrors(pingData, "No auto insurance buyers are available at the moment."));
      }

      const pingId = extractPingId(pingData);
      if (!pingId) {
        throw new Error("Buyer accepted the ping but did not return a ping_id.");
      }

      const postBody = {
        trackdrive_number: TRACKDRIVE_NUMBER,
        traffic_source_id: TRAFFIC_SOURCE_ID,
        caller_id: payload.caller_id,
        ping_id: pingId,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        city: payload.city,
        state: payload.state,
        zip: payload.zip,
        dob: payload.dob,
        marital_status: payload.marital_status,
        gender: payload.gender,
        residence_status: payload.residence_status,
        vehicle1_year: payload.vehicle1_year,
        vehicle1_make: payload.vehicle1_make,
        vehicle1_model: payload.vehicle1_model,
        ip_address: payload.ip_address,
        jornaya_leadid: payload.jornaya_leadid,
        original_lead_submit_date,
        age: payload.age,
      };

      const postResponse = await fetch("/api/post23", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(postBody),
      });
      const postData = await postResponse.json();

      if (!postResponse.ok || !postData.success) {
        throw new Error(formatErrors(postData, "Submission failed. Please try again."));
      }

      setSuccess(true);
      setForwardingNumber(
        postData.forwarding_number ||
          postData.data?.forwarding_number ||
          postData.buyers?.[0]?.forwarding_number ||
          TRACKDRIVE_NUMBER
      );
      setFormData(INITIAL_FORM);
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(false), 8000);
    return () => clearTimeout(timer);
  }, [success]);

  const inputClass =
    "block w-full rounded-lg border border-gray-300 shadow-sm p-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-900 py-7 px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Auto LN
          </h2>
          <div className="h-1 w-16 bg-blue-300 mx-auto mt-3 rounded-full"></div>
        </div>

        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border-l-4 border-red-600 rounded-r-lg shadow-sm">
            <p className="text-sm font-semibold text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-6 p-5 bg-green-50 border border-green-200 rounded-xl shadow-sm text-center">
            <p className="text-lg font-bold text-green-900">Buyer Available</p>
            <p className="text-green-700 text-sm mt-1">Lead submitted successfully.</p>
            {forwardingNumber && (
              <div className="mt-4 bg-white px-6 py-3 rounded-xl border-2 border-green-400 shadow-sm">
                <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-1">
                  Forwarding number
                </p>
                <p className="text-xl font-bold text-green-950">{forwardingNumber}</p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6" autoComplete="off">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={inputClass}
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={inputClass}
                placeholder="Smith"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Caller Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="caller_id"
              value={formData.caller_id}
              onChange={handlePhoneChange}
              className={inputClass}
              placeholder="+17194451111"
              required
            />
            <p className="mt-2 text-xs text-gray-500">Format: +1XXXXXXXXXX</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="first-and-last-name@gmail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={inputClass}
              placeholder="Boulder"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select state</option>
                {US_STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ZIP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleZipChange}
                maxLength={5}
                className={inputClass}
                placeholder="80301"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={inputClass}
                placeholder="YYYY-MM-DD"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="age"
                value={formData.age}
                onChange={handleAgeChange}
                className={inputClass}
                placeholder="35"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Marital Status <span className="text-red-500">*</span>
              </label>
              <select
                name="marital_status"
                value={formData.marital_status}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select status</option>
                {MARITAL_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Residence Status <span className="text-red-500">*</span>
            </label>
            <select
              name="residence_status"
              value={formData.residence_status}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select residence status</option>
              {RESIDENCE_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Vehicle Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vehicle1_year"
                value={formData.vehicle1_year}
                onChange={handleYearChange}
                className={inputClass}
                placeholder="2018"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Vehicle Make <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vehicle1_make"
                value={formData.vehicle1_make}
                onChange={handleChange}
                className={inputClass}
                placeholder="Toyota"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Vehicle Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vehicle1_model"
                value={formData.vehicle1_model}
                onChange={handleChange}
                className={inputClass}
                placeholder="Camry"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              IP Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="ip_address"
              value={formData.ip_address}
              onChange={handleChange}
              className={inputClass}
              placeholder="103.131.212.217"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Jornaya Lead ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="jornaya_leadid"
              value={formData.jornaya_leadid}
              onChange={handleChange}
              className={inputClass}
              placeholder="Jornaya Lead ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Optin Timestamp <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="optin_timestamp"
              value={formData.optin_timestamp}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              } transition duration-150`}
            >
              {isSubmitting ? "Checking Buyers..." : "Check Buyer Availability"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
