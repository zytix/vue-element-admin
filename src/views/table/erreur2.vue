<template>
  <div class="app-container">
    <h3>Nombre de commande : {{ countItems }}</h3>
    <el-table :key="reverseItems" :data="reverseItems" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="Commande" width="100">
        <template slot-scope="{row}">
          <span>{{ row.key }}</span><br><br>
          <span>Vérifiez <br> {{ row.error }}</span>
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
          <span v-for="n in row.items" v-else :key="'UPC-' +n.name">{{ n.UPC }} <span v-if="n.notes">{{ n.notes }}</span>  <br><br><br></span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            UPC et Notes
          </el-button>
          <el-button type="primary" size="mini" style="margin:5px;" @click="handleUpdate2(row)">
            Corrigé
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="800px">
      <el-form ref="dataForm" :model="temp" label-position="left" width="100%" style="width: 400px; margin-left:50px;">
        Veuillez séparer vos UPCs par un virgule.<br><br>
        <el-form-item v-for="n in temp.items" :key="'UPC-' +n.name" :label="n.name" prop="type">
          UPC
          <el-input v-model="n.UPC" @keyup.enter.native="updateData(temp)" />
          Notes
          <el-input v-model="n.notes" />
        </el-form-item>
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
        Êtes-vous sure d'avoir corrigés tout vos UPCs ?<br><br>
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
      products3: [],
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
      return this.products3.slice()
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
      const users = rtdb.ref('error2')
      this.$rtdbBind('products', users).then(user => {
        for (const element2 of this.products) {
          const keyOfThis = element2['.key']
          const error = element2.error
          element2[keyOfThis].error = error
          element2[keyOfThis].key = keyOfThis
          this.products3.push(element2[keyOfThis])
          console.log(element2[keyOfThis].items)
          for (const [key, value] of Object.entries(element2[keyOfThis].items)) {
            if (value.UPC) {
              console.log('yo')
            }
            console.log(`${key}: ${value}`)
            this.products2.push(value)
          }
          console.log(this.products3)
          console.log(this.products)
        }
      }
      )
    },
    handleDelete() {
      this.dialogFormVisible2 = true
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate2(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible2 = true
    },
    updateData(row) {
      /* for (const n of row.items) {
        console.log(n.name )
      } */
      for (const [key, value] of Object.entries(row.items)) {
        var upc = []
        var hasNumber = /\d/
        var ret = value.UPC.toString()
        console.log(ret)
        if (ret.includes(',')) {
          upc = ret.split(/, |,/)
        } else if (hasNumber.test(ret)) {
          upc.push(ret)
        } else {
          upc.push('0')
        }
        rtdb.ref('error2').child(value.order).child(value.order).child('items').child(key).child('UPC').set(upc)
        if (value.notes) {
          rtdb.ref('error2').child(value.order).child(value.order).child('items').child(key).child('notes').set(value.notes)
        }
        console.log(key + upc.toString())
        this.dialogFormVisible = false
      }
      // console.log(row.items)
    },
    updateData2(row) {
      console.log('ici' + row.toString())
      rtdb.ref('error2').child(row.key).once('value', snapshot => {
        rtdb.ref('processing').child(row.key).set(snapshot.child(row.key).val()).then(processIt => {
          rtdb.ref('error2').child(row.key).set(null).then(nullifyIt => {
            for (var i = this.products3.length - 1; i >= 0; --i) {
              if (this.products3[i].key === row.key) {
                this.products3.splice(i, 1)
              }
            }
            this.dialogFormVisible2 = false
          })
        })
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
