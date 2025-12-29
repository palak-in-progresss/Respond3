import { useState } from 'react';
import { createRequest } from '../../lib/api/requests';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';

interface CreateRequestModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    organizationId: string;
    organizationName: string;
}

const AVAILABLE_SKILLS = [
    'Medical',
    'First Aid',
    'Driving',
    'Logistics',
    'Communication',
    'Coordination',
    'Search & Rescue',
    'Food Distribution',
    'Shelter Management',
    'Counseling',
];

export function CreateRequestModal({
    open,
    onClose,
    onSuccess,
    organizationId,
    organizationName,
}: CreateRequestModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        skills_needed: [] as string[],
        urgency: 'medium' as 'low' | 'medium' | 'high',
        volunteers_needed: 1,
    });

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.location || formData.skills_needed.length === 0) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);

        try {
            const request = await createRequest({
                ...formData,
                organization_id: organizationId,
                organization_name: organizationName,
                status: 'open',
                volunteers_assigned: 0,
            });

            if (request) {
                alert('Request created successfully!');
                onSuccess();
                onClose();
                // Reset form
                setFormData({
                    title: '',
                    description: '',
                    location: '',
                    skills_needed: [],
                    urgency: 'medium',
                    volunteers_needed: 1,
                });
            } else {
                alert('Error creating request. Please try again.');
            }
        } catch (error) {
            console.error('Error creating request:', error);
            alert('Error creating request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleSkill = (skill: string) => {
        setFormData((prev) => ({
            ...prev,
            skills_needed: prev.skills_needed.includes(skill)
                ? prev.skills_needed.filter((s) => s !== skill)
                : [...prev.skills_needed, skill],
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Emergency Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Request Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Medical Volunteers Needed for Flood Relief"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Provide details about the emergency and what help is needed..."
                            rows={4}
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Location <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g., Kochi, Kerala"
                            required
                        />
                    </div>

                    {/* Skills Needed */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Skills Needed <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_SKILLS.map((skill) => (
                                <Badge
                                    key={skill}
                                    variant="outline"
                                    className={`cursor-pointer transition-colors ${formData.skills_needed.includes(skill)
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                    onClick={() => toggleSkill(skill)}
                                >
                                    {skill}
                                    {formData.skills_needed.includes(skill) && (
                                        <X className="w-3 h-3 ml-1" />
                                    )}
                                </Badge>
                            ))}
                        </div>
                        {formData.skills_needed.length === 0 && (
                            <p className="text-sm text-gray-500 mt-1">Select at least one skill</p>
                        )}
                    </div>

                    {/* Urgency */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Urgency Level</label>
                        <div className="flex gap-3">
                            {(['low', 'medium', 'high'] as const).map((level) => (
                                <Button
                                    key={level}
                                    type="button"
                                    variant={formData.urgency === level ? 'default' : 'outline'}
                                    className={
                                        formData.urgency === level
                                            ? level === 'high'
                                                ? 'bg-red-500 hover:bg-red-600'
                                                : level === 'medium'
                                                    ? 'bg-orange-500 hover:bg-orange-600'
                                                    : 'bg-yellow-500 hover:bg-yellow-600'
                                            : ''
                                    }
                                    onClick={() => setFormData({ ...formData, urgency: level })}
                                >
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Volunteers Needed */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Number of Volunteers Needed
                        </label>
                        <Input
                            type="number"
                            min="1"
                            max="100"
                            value={formData.volunteers_needed}
                            onChange={(e) =>
                                setFormData({ ...formData, volunteers_needed: parseInt(e.target.value) || 1 })
                            }
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-[#F59E0B] hover:bg-[#D97706]"
                        >
                            {submitting ? 'Creating...' : 'Create Request'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
