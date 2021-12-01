<template>
  <div class="app-container">
    <h3>Nombre de commande : {{ countItems }}</h3>
    <el-table :data="reverseItems" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="Commande" width="80">
        <template slot-scope="{row}">
          <span>{{ row['.key'] }}</span>
          <span v-if="row.inactive" style="float: left ;margin-top: -20px;margin-right:5px;">
            <br>
            <i style="color:#ff4949" class="el-icon-delete" size="medium" /> VOID
          </span>
        </template>
      </el-table-column>

      <el-table-column min-width="180px" align="center" label="Nom">
        <template slot-scope="{row}">
          <div v-for="n in row.items" :key="'name-' +n.name">{{ n.name }} <br><br><br></div>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="SKU">
        <template slot-scope="{row}">
          <span v-for="n in row.items" :key="'SKU-' + n.name">{{ n.SKU }}<br><br><br></span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="Quantité" width="110">
        <template slot-scope="{row}">
          <div v-for="n in row.items" :key="'count-' +n.name">{{ n.count }} <br><br><br></div>
        </template>
      </el-table-column>

      <el-table-column min-width="120px" label="UPC">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.UPC" class="edit-input" size="small" />
            <el-button
              class="cancel-btn"
              size="small"
              icon="el-icon-refresh"
              type="warning"
              @click="cancelEdit(row)"
            >
              cancel
            </el-button>
          </template>
          <span v-for="n in row.items" v-else :key="'UPC-' +n.name">{{ n.UPC }} <br><br><br></span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { rtdb } from '../../firebase'

export default {
  name: 'InlineEditTable',
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      customers_fields: {
        'SKU': 'SKU',
        'UPC4': {
          field: 'UPC',
          callback: (value) => {
            console.log(value.toString())
            return '="' + value.toString() + '"'
          }
        },
        'Quantite': 'count',
        'Nom': 'name',
        'Commande': 'order',
        'Done': ' '
      },
      products: [],
      products2: [],
      temp: {
        type: Array,
        count: Number
      },
      dialogStatus: '',
      giftCards: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        type: [{ type: Array, required: true, message: 'type is required', trigger: 'change' }]
      },
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 300
      }
    }
  },
  computed: {
    reverseItems() {
      return this.products.slice().reverse()
    },
    countItems() {
      return this.products.length
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      const users = rtdb.ref('processing')
      this.$rtdbBind('products', users.orderByChild('timestamp')).then(user => {
        for (const element of this.products) {
          for (const [key, value] of Object.entries(element.items)) {
            if (value.UPC) {
              console.log('yo')
            }
            console.log(`${key}: ${value}`)
            this.products2.push(value)
          }
        }
        console.log(this.products2)
        console.log(this.products)
      })
    },
    cancelEdit(row) {
      row.title = row.originalTitle
      row.edit = false
      this.$message({
        message: 'The title has been restored to the original value',
        type: 'warning'
      })
    },
    confirmEdit(row) {
      row.edit = false
      row.originalTitle = row.title
      this.$message({
        message: 'The title has been edited',
        type: 'success'
      })
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
/* Dropdown Button */
.dropbtn {
  background-color: #1890ff;
  color: white;
  padding: 8px;
  margin: 5px;
  font-size: 16px;
  border: none;
}

/* The container <div> - needed to position the dropdown content */
.dropdown {
  position: relative;
  display: inline-block;
}

/* Dropdown Content (Hidden by Default) */
.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f1f1f1;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

/* Links inside the dropdown */
.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

/* Change color of dropdown links on hover */
.dropdown-content a:hover {background-color: #ddd;}

/* Show the dropdown menu on hover */
.dropdown:hover .dropdown-content {display: block;}

/* Change the background color of the dropdown button when the dropdown content is shown */
.dropdown:hover .dropbtn {background-color: #1890ff;}
</style>
