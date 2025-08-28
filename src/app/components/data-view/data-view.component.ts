import { Component, inject, signal } from '@angular/core';
import { DataView } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../interfaces/product.interface';
import { DataViewModule } from 'primeng/dataview';
@Component({
  selector: 'data-view',
  imports: [DataView, ButtonModule, Tag, CommonModule],
  templateUrl: './data-view.component.html',
  styleUrl: './data-view.component.css',
})
export class DataViewComponent {
  products = signal<any>([]);

  productService = inject(ProductService);

  ngOnInit() {
    this.productService.getProducts().then((data) => {
      const d = data.slice(0, 5);
      this.products.set([...d]);
    });
  }

  getSeverity(product: Product) {
    switch (product.inventoryStatus) {
      case 'INSTOCK':
        return 'success';

      case 'LOWSTOCK':
        return 'warn';

      case 'OUTOFSTOCK':
        return 'danger';

      default:
        return null;
    }
  }
}
