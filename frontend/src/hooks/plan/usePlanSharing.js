import { useState, useEffect } from 'react';
import { useToast }            from '../useToast';
import sharingService          from '../../services/sharingService';

export const usePlanSharing = (planId) => {
  const { showToast } = useToast();

  const [shareToken, setShareToken] = useState(null);
  const [copied,     setCopied]     = useState(false);
  const [sharings,   setSharings]   = useState([]);

  useEffect(() => {
    if (!planId) return;
    sharingService.getPlanSharings(planId)
      .then(setSharings)
      .catch(() => {
      });
  }, [planId]);

  const handleShare = async (accessType) => {
    try {
      const result = await sharingService.createShareToken({
        travelPlanId: parseInt(planId),
        accessType,
        expiryDays: 7,
      });
      setShareToken(result);
      setSharings(prev => [result, ...prev]);
      showToast('Share link created successfully!');
    } catch {
      showToast('Error creating link.', 'error');
    }
  };

  const handleCopy = () => {
    if (!shareToken) return;
    navigator.clipboard.writeText(shareToken.shareUrl);
    setCopied(true);
    showToast('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteSharing = async (id) => {
    try {
      await sharingService.deleteShareToken(id);
      setSharings(prev => prev.filter(s => s.id !== id));
      if (shareToken?.id === id) setShareToken(null);
      showToast('Link revoked successfully.');
    } catch {
      showToast('Error revoking link.', 'error');
    }
  };

  return {
    shareToken, copied, sharings,
    handleShare, handleCopy, handleDeleteSharing,
  };
};
