import React, { useState, useEffect } from 'react';
import ForgeReconciler from '@forge/react';
import { Select, Button, Checkbox, CheckboxGroup, Modal, ModalTitle, Label, Form, Text } from '@forge/react';
import { invoke } from '@forge/bridge';

const defaultParts = [
    { name: "QA Demo with design/PM", required: true },
    { name: "Front-End", required: true },
    { name: "Back-End", required: true },
    { name: "Screen resolutions", required: true },
    { name: "I18n", required: true },
    { name: "Edge cases", required: true },
    { name: "Error messages", required: true },
    { name: "Accessibility", required: true }
];

const AdminConfigPage = () => {
    const [projects, setProjects] = useState(null);
    const [projectKey, setProjectKey] = useState(null);
    const [requiredInProject, setRequiredInProject] = useState([...defaultParts]);
    const [isOpen, setOpen] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('AdminConfigPage mounted');
        const fetchProjects = async () => {
            try {
                const result = await invoke('getProjects');
                console.log('Projects loaded:', result);
                setProjects(result);
            } catch (err) {
                console.error('Error loading projects:', err);
                setError('Failed to load projects');
            }
        };
        fetchProjects();
    }, []);

    const handleProjectSubmit = async (formData) => {
        const selectedProjectKey = formData.selectedProjectKey;
        setProjectKey(selectedProjectKey);
        try {
            const partsRequiredInProject = await invoke('getRequiredInProject', { projectKey: selectedProjectKey });
            console.log('Parts required in project:', partsRequiredInProject);
            if (partsRequiredInProject) {
                setRequiredInProject(partsRequiredInProject);
            } else {
                setRequiredInProject(defaultParts);
            }
            setOpen(true);
        } catch (err) {
            console.error('Error loading required parts:', err);
            setError('Failed to load required parts');
        }
    };

    const handlePartsSubmit = async (formData) => {
        const selectedParts = formData.partsInProject || [];
        let dataToSave = [...defaultParts];
        dataToSave.forEach((value, index) => {
            const isSelected = selectedParts.includes(value.name);
            dataToSave[index].required = isSelected;
        });
        try {
            await invoke('saveRequiredInProject', { requiredParts: dataToSave, projectKey });
            setRequiredInProject(dataToSave);
            setOpen(false);
        } catch (err) {
            console.error('Error saving required parts:', err);
            setError('Failed to save required parts');
        }
    };

    if (error) {
        return <Text>{error}</Text>;
    }
    if (!projects) {
        console.log('Projects not loaded yet');
        return <Text>Loading...</Text>;
    }
    console.log('Rendering AdminConfigPage', { projects, projectKey, requiredInProject, isOpen });
    return (
        <>
            <Form onSubmit={handleProjectSubmit} submitButtonText="Change required QA demo parts in this project">
                <Label labelFor="selectedProjectKey">Select a project</Label>
                <Select
                    name="selectedProjectKey"
                    isRequired
                    options={projects.values.map(project => ({
                        label: project.name,
                        value: project.key
                    }))}
                />
            </Form>

            {projectKey && isOpen && (
                <Modal onClose={() => setOpen(false)}>
                    <ModalTitle>Parts required in this project</ModalTitle>
                    <Form onSubmit={handlePartsSubmit} submitButtonText="Save">
                        <Label labelFor="partsInProject">Visible parts in this project</Label>
                        <CheckboxGroup name="partsInProject">
                            {requiredInProject.map(part => (
                                <Checkbox
                                    key={part.name}
                                    label={part.name}
                                    value={part.name}
                                    isChecked={part.required}
                                />
                            ))}
                        </CheckboxGroup>
                    </Form>
                </Modal>
            )}
        </>
    );
};

ForgeReconciler.render(
    <React.StrictMode>
        <AdminConfigPage />
    </React.StrictMode>
); 