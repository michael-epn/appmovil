import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCheckbox,
  IonContent,
  IonDatetime,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonRadio,
  IonRadioGroup,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { Candidato } from '../models/candidato';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCheckbox,
    IonContent,
    IonDatetime,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonRadio,
    IonRadioGroup,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonTitle,
    IonToolbar
  ]
})
export class HomePage {
  private readonly fb = inject(FormBuilder);
  private readonly firebase = inject(FirebaseService);

  readonly hoy = this.fechaLocal(new Date());
  readonly habilidadesOpciones = [
    'Angular',
    'Ionic',
    'JavaScript',
    'Python',
    'SQL',
    'Git',
    'Firebase'
  ];
  readonly cargos = [
    'Desarrollador móvil',
    'Analista de datos',
    'Diseñador UX/UI',
    'Soporte TI'
  ];
  readonly nivelesAcademicos = [
    'Bachillerato',
    'Tecnología',
    'Tercer nivel',
    'Posgrado'
  ];

  private readonly fechaNacimientoValida: ValidatorFn = control => {
    const fecha = control.value as string;
    return fecha && fecha.slice(0, 10) > this.hoy ? { fechaFutura: true } : null;
  };

  private readonly fechaDisponibilidadValida: ValidatorFn = control => {
    const fecha = control.value as string;
    return fecha && fecha.slice(0, 10) < this.hoy ? { fechaPasada: true } : null;
  };

  private readonly alMenosUnaHabilidad: ValidatorFn = control => {
    const habilidades = control as FormArray<FormControl<boolean>>;
    return habilidades.controls.some(habilidad => habilidad.value)
      ? null
      : { minimoUna: true };
  };

  readonly formulario = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.minLength(3)]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?=(?:\D*\d){7,15}\D*$)\+?[\d\s()-]+$/)
      ]
    ],
    fechaNacimiento: ['', [Validators.required, this.fechaNacimientoValida]],
    cargo: ['', Validators.required],
    nivelAcademico: ['', Validators.required],
    experienciaAnios: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(50),
      Validators.pattern(/^\d+$/)
    ]),
    modalidad: ['', Validators.required],
    habilidades: this.fb.array(
      this.habilidadesOpciones.map(() => this.fb.nonNullable.control(false)),
      { validators: [this.alMenosUnaHabilidad] }
    ),
    fechaDisponibilidad: [
      '',
      [Validators.required, this.fechaDisponibilidadValida]
    ],
    aspiracionSalarial: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01)
    ]),
    resumen: ['', [Validators.required, Validators.minLength(30)]],
    consentimiento: [false, Validators.requiredTrue]
  });

  guardando = false;
  mensaje = '';

  get habilidades(): FormArray<FormControl<boolean>> {
    return this.formulario.controls.habilidades;
  }

  async guardar(): Promise<void> {
    if (this.formulario.invalid || this.guardando) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    if (
      valores.experienciaAnios === null ||
      valores.aspiracionSalarial === null
    ) {
      this.formulario.markAllAsTouched();
      return;
    }

    const candidato: Candidato = {
      nombres: valores.nombres.trim(),
      correo: valores.correo.trim(),
      telefono: valores.telefono.trim(),
      fechaNacimiento: valores.fechaNacimiento,
      cargo: valores.cargo,
      nivelAcademico: valores.nivelAcademico,
      experienciaAnios: valores.experienciaAnios,
      modalidad: valores.modalidad,
      habilidades: this.habilidadesOpciones.filter(
        (_, indice) => valores.habilidades[indice]
      ),
      fechaDisponibilidad: valores.fechaDisponibilidad,
      aspiracionSalarial: valores.aspiracionSalarial,
      resumen: valores.resumen.trim(),
      consentimiento: valores.consentimiento,
      creadoEn: new Date()
    };

    this.guardando = true;
    this.mensaje = '';
    try {
      await this.firebase.guardarCandidato(candidato);
      this.formulario.reset();
      this.mensaje = 'Candidato registrado correctamente.';
    } catch (error) {
      console.error(error);
      this.mensaje =
        'No se pudo registrar el candidato. Revisa la conexión y las reglas de Firestore.';
    } finally {
      this.guardando = false;
    }
  }

  private fechaLocal(fecha: Date): string {
    const desplazamiento = fecha.getTimezoneOffset() * 60_000;
    return new Date(fecha.getTime() - desplazamiento)
      .toISOString()
      .slice(0, 10);
  }
}
