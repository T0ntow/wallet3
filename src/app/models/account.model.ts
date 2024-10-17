// src/app/models/account.model.ts

export interface Account {
    conta_id: number;  // ID da conta, se for numérico
    nome: string;      // Nome da conta
    tipo: string;      // Tipo da conta (ex: corrente, poupança, etc.)
    instituicao: string; // Instituição financeira da conta
  }
  