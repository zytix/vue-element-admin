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

      <el-table-column min-width="180px" align="center" label="UPC">
        <template slot-scope="{row}">
          <span v-for="(item, key) in row" :key="key">
            <span v-if="key != 'notes'">{{ key }} &nbsp; &nbsp;<el-button icon="el-icon-search" circle @click="copyToClipBoard(key)" /><br><br></span>
            <span v-else>{{ item }}<br><br></span></span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="Erreur">
        <template slot-scope="{row}">
          <span v-for="(item, key) in row" :key="key"><el-popover
            placement="top-start"
            width="200"
            trigger="hover"
            :content="item.error"
          >
            <el-button slot="reference">Erreur</el-button>
          </el-popover><br><br><br></span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="Quantité">
        <template slot-scope="{row}">
          <span v-for="(item, key) in row" :key="key">{{ item.count }}<br><br><br></span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="Initial" width="110">
        <template slot-scope="{row}">
          <span v-for="(item, key) in row" :key="key">{{ item.initial }}<br><br><br></span>
        </template>
      </el-table-column>

      <el-table-column min-width="120px" label="Final">
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
          <span v-for="(item, key) in row" v-else :key="key">{{ item.final }}<br><br><br></span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row,row['.key'])">
            Envoyez succès
          </el-button>
          <el-button type="primary" size="mini" style="margin:5px;" @click="handleUpdate2(row,row['.key'])">
            Notes
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="800px">
      <el-form ref="dataForm" :model="temp" label-position="left" width="100%" style="width: 400px; margin-left:50px;">
        Êtes-vous sure d'avoir corrigés tout vos UPCs ?<br><br>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="updateData(temp)">
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible2" width="800px">
      <el-form ref="dataForm" :model="temp" label-position="left" width="100%" style="width: 400px; margin-left:50px;">
        <el-form-item :key="'notes'" :label="'Notes'" prop="type">
          <el-input v-model="temp.notes" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible2 = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="updateData2(temp)">
          Confirm
        </el-button>
      </div>
    </el-dialog>
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
      dialogFormVisible: false,
      dialogFormVisible2: false,
      dialogFormVisible3: false,
      dialogFormVisible4: false,
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
      const users = rtdb.ref('error')
      this.$rtdbBind('products', users).then(user => {
        console.log(this.products)
      })
    },
    copyToClipBoard(textToCopy) {
      navigator.clipboard.writeText(textToCopy)
    },
    handleUpdate(row, key) {
      console.log(key)
      this.temp = Object.assign({}, row) // copy obj
      this.temp.key = key
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate2(row, key) {
      console.log(key)
      this.temp = Object.assign({}, row) // copy obj
      this.temp.key = key
      this.dialogStatus = 'update'
      this.dialogFormVisible2 = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData(row) {
      console.log(row)
      for (const [key, value] of Object.entries(row)) {
        if (key !== 'key') {
          console.log(key + value)
          rtdb.ref('succes').child(row.key).child(key).set(value).then(() => {
            rtdb.ref('error').child(row.key).child(key).set(null)
            this.dialogFormVisible = false
          })
        }
      }
    },
    updateData2(row) {
      rtdb.ref('error').child(row.key).child('notes').set(row.notes).then(() => { this.dialogFormVisible2 = false })
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
