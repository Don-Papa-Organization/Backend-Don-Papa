import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainStatistics } from '../main-statistics/main-statistics';
import { StatisticsFacade } from '../services/statistics.facade';
import { of } from 'rxjs';
import { DashboardStateDto } from '../../../../../domain/statistics/dtos/analytics.dto';

/**
 * Pruebas de Robustez - Plan de Verificación
 * Valida estados vacíos, errores parciales y persistencia de filtros
 */
describe('Statistics Module - Robustness Tests', () => {
  let component: MainStatistics;
  let fixture: ComponentFixture<MainStatistics>;
  let mockFacade: jasmine.SpyObj<StatisticsFacade>;

  beforeEach(async () => {
    mockFacade = jasmine.createSpyObj('StatisticsFacade', [
      'loadDashboard',
      'downloadPDF',
      'downloadJSON',
      'getDashboardState'
    ]);

    mockFacade.getDashboardState.and.returnValue(of({} as DashboardStateDto));
    mockFacade.loadDashboard.and.returnValue(of({} as DashboardStateDto));
    mockFacade.downloadPDF.and.returnValue(of(new Blob()));
    mockFacade.downloadJSON.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      declarations: [MainStatistics],
      providers: [
        { provide: StatisticsFacade, useValue: mockFacade }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainStatistics);
    component = fixture.componentInstance;
  });

  describe('Estado Vacío - Arrays Vacíos de MS6', () => {
    it('debe retornar arrays vacíos cuando topProducts está vacío', () => {
      const topProductsRows = component.buildTopProductsRows([]);
      expect(topProductsRows.length).toBe(0);
    });

    it('debe retornar arrays vacíos cuando deadStock está vacío', () => {
      const deadStockRows = component.buildDeadStockRows([]);
      expect(deadStockRows.length).toBe(0);
    });

    it('debe retornar arrays vacíos cuando frequentUsers está vacío', () => {
      const frequentUsersRows = component.buildFrequentUsersRows([]);
      expect(frequentUsersRows.length).toBe(0);
    });
  });

  describe('Error Parcial - Fallo en Endpoint Individual', () => {
    it('debe manejar gracefully null values sin lanzar excepciones', () => {
      expect(() => {
        component.buildTopProductsRows(null);
        component.buildDeadStockRows(null);
        component.buildFrequentUsersRows(null);
      }).not.toThrow();
    });
  });

  describe('Persistencia de Filtros - Navegación entre Módulos', () => {
    it('debe disparar loadDashboard al inicializar componente', () => {
      fixture.detectChanges();
      
      expect(mockFacade.loadDashboard).toHaveBeenCalled();
    });

    it('debe recargar dashboard cuando filtros cambian', () => {
      component.filters = {
        startDate: '2026-02-01',
        endDate: '2026-02-27',
        limit: 10
      };

      component.onFilterChange();
      
      expect(mockFacade.loadDashboard).toHaveBeenCalledWith(component.filters);
    });
  });

  describe('Exportación PDF - Validación de Descarga', () => {
    it('debe llamar a downloadPDF cuando se solicita exportación', () => {
      component.filters = {
        startDate: '2026-02-01',
        endDate: '2026-02-27',
        limit: 10
      };

      component.onDownloadPDF();

      expect(mockFacade.downloadPDF).toHaveBeenCalledWith(component.filters);
    });

    it('debe llamar a downloadJSON cuando se solicita exportación JSON', () => {
      component.filters = {
        startDate: '2026-02-01',
        endDate: '2026-02-27',
        limit: 10
      };

      component.onDownloadJSON();

      expect(mockFacade.downloadJSON).toHaveBeenCalledWith(component.filters);
    });
  });
});
