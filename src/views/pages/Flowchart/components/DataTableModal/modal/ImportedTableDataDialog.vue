<template>
  <a-modal
    width="70%"
    :visible="isOpen"
    @cancel="$emit('close')"
  >
    <template #footer>
      <div>
        <a-button @click="$emit('close')">
          Close
        </a-button>
      </div>
    </template>
    <template #title>
      <div style="text-align: center; width: 100%">
        Table {{ record?.logicalTableName }}
      </div>
    </template>

    <!-- table start -->
    <div>
      <div style="width: 100%; text-align: right">
        <b>{{ columns.length }}</b> columns
        <br>
        <b>{{ rows.length }}</b> records
      </div>

      <a-table
        :bordered="true"
        :data-source="rows"
        :columns="columns"
        row-key="id"
        :scroll="{ x:5000, y: 500 }"
        :loading="isLoading"
      >
        <template
          #filterDropdown="{
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            column,
          }"
        >
          <div style="padding: 8px">
            <a-input
              ref="searchInput"
              :placeholder="`Search ${column.dataIndex}`"
              :value="selectedKeys[0]"
              style="width: 188px; margin-bottom: 8px; display: block"
              @change="
                (e) => setSelectedKeys(e.target.value ? [e.target.value] : [])
              "
              @pressEnter="
                handleSearch(selectedKeys, confirm, column.dataIndex)
              "
            />
            <a-button
              type="primary"
              size="small"
              style="width: 90px; margin-right: 8px"
              @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
            >
              <template #icon>
                <SearchOutlined />
              </template>
              Search
            </a-button>
            <a-button
              size="small"
              style="width: 90px"
              @click="handleFilterReset(clearFilters)"
            >
              Reset
            </a-button>
          </div>
        </template>
        <template #filterIcon="filtered">
          <SearchOutlined
            :style="{ color: filtered ? '#108ee9' : undefined }"
          />
        </template>
        <template #customRender="{ text, column }">
          <span v-if="searchText && searchedColumn === column.dataIndex">
            <template
              v-for="(fragment, i) in text
                .toString()
                .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
            >
              <mark
                v-if="fragment.toLowerCase() === searchText.toLowerCase()"
                :key="i"
                class="highlight"
              >
                {{ fragment }}
              </mark>
              <template v-else>{{ fragment }}</template>
            </template>
          </span>
          <template v-else>
            {{ text }}
          </template>
        </template>
      </a-table>
    </div>
    <!-- table end -->
  </a-modal>
</template>
<script>
import {  SearchOutlined } from "@ant-design/icons-vue";
import {queryImportedTableFieldById, queryImportedTableDataById} from "@/services/datatable"
export default {
  components: {
    SearchOutlined,
  },
  props: {
    record: {
      type: Object,
      default: () => null
    },
    isOpen: {
      type: Boolean,
      default: false
    }
  },

  data: function() {
    return {
      columns: [],
      rows: [],
      isLoading: false,
      searchText: "",
      searchedColumn: ""

    }
  },
   watch: {
    record: function(val) {
      if(val) {
        this.loadData()
      }
    }
  },
 
  methods: {
    loadData: async function() {
      try{
        this.columns = []
        this.rows = []
        this.isLoading = true

        const importedTableFields = await queryImportedTableFieldById(this.record.id)
        const importedTableDataRows = await queryImportedTableDataById(this.record.id)
        this.columns = importedTableFields.map(importedTableField => ({
            title: importedTableField.fieldName,
            dataIndex: importedTableField.fieldName,
            key: importedTableField.fieldName,
            // ellipsis: true,
            width: "150px",
            align: "center",
            sorter: (record, record2) => record[importedTableField.fieldName] > record2[importedTableField.fieldName] ? 1 : -1,
            onFilter: (value, record) => {
              return record[importedTableField.fieldName].toString().toLowerCase().includes(value.toLowerCase())
            },
            onFilterDropdownVisibleChange: (visible) => {
              if (visible) {
                setTimeout(() => {
                  this.$refs.searchInput.focus();
                }, 100);
              }
            },
            slots: {
              filterDropdown: 'filterDropdown',
              filterIcon: 'filterIcon',
              customRender: 'customRender'
            }
          }))
        this.rows = importedTableDataRows

      } catch(e) {
        console.error(e)
      } finally {
        this.isLoading = false
      }
      
    },

    handleFilterReset: function(clearFilters) {
      clearFilters();
      this.searchText = "";
    },

    handleSearch: function(selectedKeys, confirm, dataIndex) {
      confirm();
      this.searchText = selectedKeys[0];
      this.searchedColumn = dataIndex;
    }
  }
}
</script>
