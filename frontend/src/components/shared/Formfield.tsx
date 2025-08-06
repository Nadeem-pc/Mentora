import { FormControl, FormItem, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form'

interface FormFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    placeholder?: string;
    type?: 'text' | 'password' | 'email' | 'file';
}

const FormField = <T extends FieldValues>({ control, name, placeholder, type="text"}:FormFieldProps<T>) => (
    <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
            <FormItem>
                <FormControl>
                    <Input className='input rounded-bl-none' type={type} placeholder={placeholder} {...field} />
                </FormControl>
                <FormMessage>
                    {fieldState.error?.message}
                </FormMessage>
            </FormItem>
        )}
    />
)

export default FormField