export interface FormField {
    key: string;
    label: string;
    placeholder: string;
    type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'date';
    required?: boolean;
    validators?: any[];
}

export interface FormAction {
    label: string;
    type: 'submit' | 'button';
    onClick?: () => void;
}
  
export interface FormConfig {
    title: string;
    fields: FormField[];
    actions: FormAction[];
}

