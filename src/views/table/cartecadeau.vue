<template>
  <div class="app-container">
    <el-button type="primary" icon="el-icon-refresh" @click="addGiftCard">
      Ajoutez une carte cadeau
    </el-button>
    <h3>Nombre de cartes cadeaux : {{ countItems }}</h3>
    <h3>Nombre de cartes cadeaux : {{ countBalance }}</h3>
    <el-table :data="reverseItems" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="Nom" width="160">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
          <span v-if="row.inactive" style="float: left ;margin-top: -20px;margin-right:5px;">
            <br>
            <i style="color:#ff4949" class="el-icon-delete" size="medium" /> VOID
          </span>
        </template>
      </el-table-column>

      <el-table-column min-width="180px" align="center" label="Numéro">
        <template slot-scope="{row}">
          <span>{{ row.card }}<br><br><br></span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="Balance">
        <template slot-scope="{row}">
          <span>{{ row.balance }}<br><br><br></span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="Personne">
        <template slot-scope="{row}">
          <span>{{ row.firstName + ' ' + row.lastName }}<br><br><br></span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="Lightspeed">
        <template slot-scope="{row}">
          <span v-if="!row.lightspeedCreated || row.lightspeedUpdated"><i style="color:#ff4949" class="el-icon-error" size="medium" /></span>
          <span v-else-if="row.lightspeedCreated"><i style="color:#ff4949" class="el-icon-check" size="medium" /></span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="Shopify">
        <template slot-scope="{row}">
          <span v-if="!row.shopifyCreated || row.shopifyUpdated"><i style="color:#ff4949" class="el-icon-error" size="medium" /></span>
          <span v-else-if="row.shopifyCreated"><i style="color:#ff4949" class="el-icon-check" size="medium" /></span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row,row['.key'])">
            Balance
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="800px">
      <el-form ref="dataForm" :model="temp" label-position="left" width="100%" style="width: 400px; margin-left:50px;">
        Éditez la balance? <br><br>
        <el-form-item :key="'UPC-'" :label="'balance'" prop="type">
          <el-input v-model="temp.balance" />
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
        Veuillez remplir les champs pour ajouter une nouvelle carte cadeau!<br>
        <el-form-item :key="'UPC-'" prop="type">
          Numéro de carte
          <el-input v-model="temp.card" type="number" :label="'Numéro de carte'" />
          Montant
          <el-input v-model="temp.balance" type="number" :label="'Montant'" />
          Prénom
          <el-input v-model="temp.firstName" :label="'Prénom'" />
          Nom
          <el-input v-model="temp.lastName" :label="'Nom'" />
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
      totalBalance: 0,
      temp: {
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
      return this.products.slice()
    },
    countBalance() {
      for (const [key, value] of Object.entries(this.products)) {
        console.log(key)
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.totalBalance += parseFloat(value.balance.substr(1))
      }
      return this.totalBalance
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
      const users = rtdb.ref('giftCards')
      this.$rtdbBind('products', users).then(user => {
        // console.log(this.products)
      })
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
    addGiftCard() {
      this.dialogFormVisible2 = true
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
      row.lightspeedCreated = false
      row.lightspeedUpdated = false
      row.shopifyCreated = false
      row.shopifyUpdated = false
      row.name = 'Carte ' + row.card
      row.balance = '$' + row.balance + '.00'
      row.card = Number(row.card)
      rtdb.ref('giftCards').push().set(row)
      this.dialogFormVisible2 = false
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
