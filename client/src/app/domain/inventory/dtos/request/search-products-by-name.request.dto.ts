export interface SearchProductsByNameRequestDto {
  nombre: string;
  activo?: boolean;
  page?: number;
  limit?: number;
}
