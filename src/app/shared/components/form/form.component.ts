import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../ui/input/input.component';
import { ButtonComponent } from '../ui/button/button.component';
import { FormConfig } from '../../models/form.model';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, CommonModule, InputComponent, ButtonComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {
    @Input() config: FormConfig = {
      title: 'Default Form',
      fields: [],
      actions: []
    };
    
    form: FormGroup = new FormGroup({});

    ngOnInit() {
      this.buildForm();
    }


    private buildForm() {
      const formControls: { [key: string]: FormControl } = {};
      
      this.config.fields.forEach(field => {
        const validators = [];
        if (field.required) {
          validators.push(Validators.required);
        }
        if (field.validators) {
          validators.push(...field.validators);
        }
        
        formControls[field.key] = new FormControl('', validators);
      });

      this.form = new FormGroup(formControls);
    }

    onSubmit() {
      if (this.form.valid) {
        console.log('Form submitted:', this.form.value);
      } else {
        this.markFormGroupTouched();
      }
    }

    private markFormGroupTouched() {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }

    getFieldError(fieldKey: string): string | null {
      const field = this.form.get(fieldKey);
      if (field && field.errors) {
        if (field.errors['required']) {
          return `${this.getFieldLabel(fieldKey)} is required`;
        }

      }
      return null;
    }

    private getFieldLabel(fieldKey: string): string {
      const field = this.config.fields.find(f => f.key === fieldKey);
      return field?.placeholder || fieldKey;
    }
}
