import React, {Dispatch, ChangeEvent, useRef, useEffect, useReducer, RefObject} from 'react';
import {FlowType} from '../../../domain/apps/flow-type.enum';
import {ApplyButton, Form, FormGroup, FormInput} from '../../common';
import {FlowTypeHelper} from './FlowTypeHelper';
import {FlowTypeSelect} from './FlowTypeSelect';
import {appFormReducer, CreateFormState} from '../reducers/app-form-reducer';
import {
    inputChanged,
    setError,
    formIsInvalid,
    formIsValid,
    codeGenerated,
    CreateFormAction
} from '../actions/create-form-actions';
import {isErr} from '../../shared/fetch/result';
import {sanitize} from '../../shared/sanitize';
import {Translate} from '../../shared/translate';
import {useCreateApp, CreateAppData} from '../use-create-app';

const initialState: CreateFormState = {
    controls: {
        code: {name: 'code', value: '', errors: {}, dirty: false, valid: false},
        label: {name: 'label', value: '', errors: {}, dirty: false, valid: false},
        flow_type: {
            name: 'flow_type',
            value: FlowType.DATA_SOURCE,
            errors: {},
            dirty: false,
            valid: true,
        },
    },
    valid: false,
};

const useFormValidation = (
    state: CreateFormState,
    dispatch: Dispatch<CreateFormAction>,
    codeInputRef: RefObject<HTMLInputElement>,
    labelInputRef: RefObject<HTMLInputElement>
) => {
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }
        [codeInputRef, labelInputRef].forEach(inputRef => {
            const input = inputRef.current;
            if (null === input) {
                return;
            }

            const name = input.name;
            if (false === input.checkValidity() &&
              0 === Object.keys(state.controls[name].errors).length &&
              true === state.controls[name].dirty
            ) {
                if (input.validity.valueMissing) {
                    dispatch(setError(name, `akeneo_apps.constraint.${name}.required`));
                }
                if (input.validity.patternMismatch) {
                    dispatch(setError(name, `akeneo_apps.constraint.${name}.invalid`));
                }
            }
        });
    }, [state.controls.code.value, state.controls.label.value, dispatch, codeInputRef, labelInputRef]);

    useEffect(() => {
        if (false === state.controls.label.valid ||
          false === state.controls.code.valid
        ) {
            dispatch(formIsInvalid());

            return;
        }
        dispatch(formIsValid());
    }, [state.controls.label.valid, state.controls.code.valid]);
};

export const AppCreateForm = () => {
    const [state, dispatch] = useReducer(appFormReducer, initialState);
    const createNewApp = useCreateApp();

    const codeInputRef = useRef<HTMLInputElement>(null);
    const labelInputRef = useRef<HTMLInputElement>(null);
    useFormValidation(state, dispatch, codeInputRef, labelInputRef);

    useEffect(() => {
        if (true === state.controls.code.dirty) {
            return;
        }

        const value = sanitize(state.controls.label.value);
        if (state.controls.code.value === value) {
            return;
        }

        dispatch(codeGenerated(value));
    }, [state.controls.label.value, dispatch, state.controls.code.dirty, state.controls.code.value]);

    const handleSave = async () => {
        if (false === state.valid) {
            return;
        }
        const data: CreateAppData = {
            code: state.controls.code.value,
            label: state.controls.label.value,
            flow_type: state.controls.flow_type.value as FlowType,
        };

        const result = await createNewApp(data);
        if (isErr(result)) {
            result.error.errors.forEach(({name, reason}) => dispatch(setError(name, reason)));
        }
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        dispatch(inputChanged(event.currentTarget.name, event.currentTarget.value));
    };

    const handleFlowTypeSelect = (flowType: FlowType) => dispatch(inputChanged('flow_type', flowType));

    return (
        <Form>
            <FormGroup controlId='label' label='pim_apps.app.label' errors={Object.keys(state.controls.label.errors)}>
                <FormInput
                    ref={labelInputRef}
                    type='text'
                    name='label'
                    value={state.controls.label.value}
                    onChange={handleChange}
                    required
                    maxLength={100}
                />
            </FormGroup>

            <FormGroup controlId='code' label='pim_apps.app.code' errors={Object.keys(state.controls.code.errors)}>
                <FormInput
                    ref={codeInputRef}
                    type='text'
                    name='code'
                    value={state.controls.code.value}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    pattern='^[0-9a-zA-Z_]+$'
                />
            </FormGroup>

            <FormGroup
                controlId='flow_type'
                label='pim_apps.app.flow_type'
                info={<FlowTypeHelper />}
                required
                errors={Object.keys(state.controls.flow_type.errors)}
            >
                <FlowTypeSelect value={state.controls.flow_type.value as FlowType} onChange={handleFlowTypeSelect} />
            </FormGroup>

            <ApplyButton onClick={handleSave} disabled={false === state.valid}>
                <Translate id='pim_common.save' />
            </ApplyButton>
        </Form>
    );
};
