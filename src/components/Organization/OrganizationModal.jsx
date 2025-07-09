// src/components/Organization/OrganizationModal.jsx - Organization create/edit modal
import React, { useState, useEffect } from "react";
import { X, Building2, MapPin, FileText } from "lucide-react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { organizationService } from "../../services/organizations";
import { showToast } from "../../utils/toast";

export const OrganizationModal = ({
  isOpen,
  onClose,
  organization,
  mode = "create",
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    workLocation: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && organization) {
        setFormData({
          name: organization.name || "",
          workLocation: organization.workLocation || "",
        });
      } else {
        setFormData({
          name: "",
          workLocation: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, organization, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Organization name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "view") return onClose();

    if (!validate()) return;

    setLoading(true);

    try {
      let result;

      if (mode === "create") {
        result = await organizationService.create(formData);
        console.log("Organization created:", result);
      } else {
        result = await organizationService.update(organization.id, formData);
        console.log("Organization updated:", result);
      }

      // Make sure we have a valid organization object with a name property
      if (!result || typeof result !== "object") {
        result = { ...formData, id: Date.now() }; // Fallback object if API response is invalid
        console.warn("Invalid response from API, using fallback:", result);
      }

      // Ensure the result has a name property
      if (!result.name && formData.name) {
        result.name = formData.name;
        console.warn("Name missing from API response, using form data name");
      }

      onSuccess(result, mode);
    } catch (error) {
      console.error("Error saving organization:", error);
      showToast.error(`Failed to ${mode} organization. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === "view";
  const title = {
    create: "Add New Organization",
    edit: "Edit Organization",
    view: "Organization Details",
  }[mode];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        !isReadOnly ? (
          <>
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <span className="animate-spin mr-2">●</span>
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : mode === "create" ? (
                "Create Organization"
              ) : (
                "Save Changes"
              )}
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>Close</Button>
        )
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Organization Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter organization name"
            icon={Building2}
            error={errors.name}
            disabled={isReadOnly}
            required
          />
        </div>

        <div>
          <Input
            label="Work Location"
            id="workLocation"
            name="workLocation"
            value={formData.workLocation}
            onChange={handleChange}
            placeholder="Enter work location"
            icon={MapPin}
            disabled={isReadOnly}
          />
        </div>
      </form>
    </Modal>
  );
};

export default OrganizationModal;
