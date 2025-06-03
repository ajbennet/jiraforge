import React, { useState, useEffect } from 'react';
import ForgeReconciler from '@forge/react';
import { Button, Checkbox, CheckboxGroup, Modal, ModalTitle, Table, Text, Label, Form, Row, Cell, Head } from '@forge/react';
import { useProductContext } from '@forge/react';
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

const App = () => {
    const context = useProductContext();
    console.log('Forge context:', context);

    const issueKey = context?.platformContext?.issueKey;
    const projectKey = context?.platformContext?.projectKey;

    if (!issueKey || !projectKey) {
        return <Text>Missing issue or project context. This app must be used inside an Epic issue.</Text>;
    }

    const [values, setValues] = useState(null);
    const [requiredInProject, setRequiredInProject] = useState(null);
    const [isOpen, setOpen] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('App mounted');
        const fetchValues = async () => {
            try {
                const result = await invoke('getValues', { issueKey });
                console.log('Values loaded:', result);
                setValues(result);
            } catch (err) {
                console.error('Error loading values:', err);
                setError('Failed to load values');
            }
        };
        fetchValues();
    }, [issueKey]);

    useEffect(() => {
        const fetchRequiredInProject = async () => {
            try {
                const result = await invoke('getRequiredInProject', { projectKey });
                console.log('Required in project loaded:', result);
                setRequiredInProject(result);
            } catch (err) {
                console.error('Error loading required in project:', err);
                setError('Failed to load required in project');
            }
        };
        if (isOpen) {
            fetchRequiredInProject();
        }
    }, [projectKey, isOpen]);

    const handleSubmit = async (formData) => {
        const selectedParts = formData.parts || [];
        let dataToSave = requiredInProject ? [...requiredInProject] : [...defaultParts];
        dataToSave.forEach((value, index) => {
            const isSelected = selectedParts.includes(value.name);
            dataToSave[index].completed = isSelected;
        });
        try {
            await invoke('saveValues', { formData: dataToSave, issueKey });
            setValues(dataToSave);
            setOpen(false);
        } catch (err) {
            console.error('Error saving values:', err);
            setError('Failed to save values');
        }
    };

    const partsInProject = requiredInProject || defaultParts;
    let qaDemoParts = values;

    if (values) {
        qaDemoParts = values;
        partsInProject.forEach((part, index) => {
            const indexInValues = values.findIndex(value => value.name === part.name);
            if (indexInValues !== -1) {
                qaDemoParts[indexInValues].required = part.required;
            } else {
                qaDemoParts.push(part);
            }
        });
    } else {
        qaDemoParts = partsInProject;
    }

    if (error) {
        return <Text>{error}</Text>;
    }
    console.log('Rendering App', { values, requiredInProject, qaDemoParts });
    return (
        <>
            <Button
                text="Update QA Demo status"
                onClick={() => setOpen(true)}
            />

            {isOpen && (
                <Modal onClose={() => setOpen(false)}>
                    <ModalTitle>QA Demo Validator</ModalTitle>
                    <Form onSubmit={handleSubmit} submitButtonText="Submit">
                        <Label labelFor="parts">Areas covered</Label>
                        <CheckboxGroup name="parts">
                            {qaDemoParts.map(part => part.required ? (
                                <Checkbox
                                    key={part.name}
                                    label={part.name}
                                    value={part.name}
                                    isChecked={part.completed}
                                />
                            ) : null)}
                        </CheckboxGroup>
                    </Form>
                </Modal>
            )}

            <Table>
                <Head>
                    <Cell><Text>Item</Text></Cell>
                    <Cell><Text>Completed</Text></Cell>
                </Head>
                {qaDemoParts.map(entry => entry.required ? (
                    <Row key={entry.name}>
                        <Cell><Text>{entry.name}</Text></Cell>
                        <Cell>{entry.completed ? <Text>✅</Text> : null}</Cell>
                    </Row>
                ) : null)}
            </Table>
        </>
    );
};

ForgeReconciler.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
); 