// Proposal API helpers

export type Proposal = {
  id: string;
  title: string;
  content?: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "APPLIED";
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  submittedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  appliedAt?: string;
  appliedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  reason?: string;
};

export type UpdateProposalPayload = {
  title?: string;
  content?: string;
  updatedBy?: string;
};

export type SubmitProposalPayload = {
  submittedBy?: string;
};

export type ApproveProposalPayload = {
  approvedBy?: string;
};

export type RejectProposalPayload = {
  reason?: string;
  rejectedBy?: string;
};

export type ApplyProposalPayload = {
  appliedBy?: string;
};

/**
 * List all proposals
 */
export async function listProposals(API_BASE: string): Promise<Proposal[]> {
  const res = await fetch(`${API_BASE}/api/proposals`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch proposals: HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Get a single proposal by ID
 */
export async function getProposal(API_BASE: string, id: string): Promise<Proposal> {
  const res = await fetch(`${API_BASE}/api/proposals/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 404) {
      throw new Error("Proposal not found");
    }
    throw new Error(errorData.error || `Failed to fetch proposal: HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Update a proposal
 */
export async function updateProposal(
  API_BASE: string,
  id: string,
  payload: UpdateProposalPayload
): Promise<Proposal> {
  const res = await fetch(`${API_BASE}/api/proposals/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update proposal: HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Submit a proposal
 */
export async function submitProposal(
  API_BASE: string,
  id: string,
  payload: SubmitProposalPayload = {}
): Promise<Proposal> {
  const res = await fetch(`${API_BASE}/api/proposals/${id}/submit`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to submit proposal: HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Approve a proposal
 */
export async function approveProposal(
  API_BASE: string,
  id: string,
  payload: ApproveProposalPayload = {}
): Promise<Proposal> {
  const res = await fetch(`${API_BASE}/api/proposals/${id}/approve`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to approve proposal: HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Reject a proposal
 */
export async function rejectProposal(
  API_BASE: string,
  id: string,
  payload: RejectProposalPayload = {}
): Promise<Proposal> {
  const res = await fetch(`${API_BASE}/api/proposals/${id}/reject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to reject proposal: HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Apply a proposal
 */
export async function applyProposal(
  API_BASE: string,
  id: string,
  payload: ApplyProposalPayload = {}
): Promise<Proposal> {
  const res = await fetch(`${API_BASE}/api/proposals/${id}/apply`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to apply proposal: HTTP ${res.status}`);
  }
  return res.json();
}



