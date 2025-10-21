import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layout";
import {
  Card,
  Table,
  Button,
  Modal,
  InputField,
  Badge,
  LoadingSpinner,
  Alert,
  EmptyState,
  SearchInput,
} from "../../common";
import { formatCurrency } from "../../../utils/helpers";
import { vehicleApi } from "../../../services/vehicleApi";
import { inventoryApi } from "../../../services/inventoryApi";
import { useAuth } from "../../../hooks/useAuth";

function EVMStaffInventoryPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchInventory();
    }
  }, [user]);

  useEffect(() => {
    filterVehicles();
  }, [searchQuery, vehicles]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setAlert({ type: "", message: "" });
      const response = await vehicleApi.getAll(user.id);
      if (response.isSuccess) {
        setVehicles(response.data);
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to load inventory",
        });
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setAlert({
        type: "error",
        message:
          error.response?.data?.messages?.[0] || "Failed to load inventory",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    if (!searchQuery) {
      setFilteredVehicles(vehicles);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = vehicles.filter(
      (vehicle) =>
        vehicle.modelName.toLowerCase().includes(query) ||
        vehicle.version.toLowerCase().includes(query) ||
        vehicle.category.toLowerCase().includes(query)
    );
    setFilteredVehicles(filtered);
  };

  const getStockVariant = (stock) => {
    if (stock === 0) return "danger";
    if (stock <= 5) return "warning";
    return "success";
  };

  const openAddStockModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setQuantity(1);
    setAlert({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
    setQuantity(1);
    setAlert({ type: "", message: "" });
  };

  const handleAddStock = async (e) => {
    e.preventDefault();

    if (!selectedVehicle || quantity < 1) {
      setAlert({ type: "error", message: "Invalid quantity" });
      return;
    }

    setIsSubmitting(true);
    setAlert({ type: "", message: "" });

    try {
      const response = await inventoryApi.addInventory(
        selectedVehicle.id,
        quantity
      );

      if (response.isSuccess) {
        setAlert({
          type: "success",
          message:
            response.messages?.[0] ||
            `${quantity} units added to inventory successfully!`,
        });

        // Refresh inventory after delay
        setTimeout(() => {
          closeModal();
          fetchInventory();
        }, 1500);
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to add stock",
        });
      }
    } catch (error) {
      console.error("Error adding stock:", error);
      setAlert({
        type: "error",
        message:
          error.response?.data?.messages?.[0] ||
          "Failed to add stock. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalStock = vehicles.reduce(
    (sum, v) => sum + (v.currentStock || 0),
    0
  );
  const outOfStock = vehicles.filter((v) => v.currentStock === 0).length;
  const lowStock = vehicles.filter(
    (v) => v.currentStock > 0 && v.currentStock <= 5
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Manufacturer Inventory
            </h1>
            <p className="text-slate-400 mt-1">
              Manage vehicle stock at manufacturer level
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && vehicles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Models</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {vehicles.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Stock</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {totalStock}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Low Stock</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {lowStock}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Out of Stock</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {outOfStock}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Search */}
        <Card>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by model, version, or category..."
            className="w-full"
          />
        </Card>

        {/* Alert */}
        <Alert type={alert.type} message={alert.message} />

        {/* Inventory Table */}
        <Card padding={false}>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" text="Loading inventory..." />
            </div>
          ) : filteredVehicles.length === 0 ? (
            <EmptyState
              title="No vehicles found"
              description={
                searchQuery
                  ? "Try adjusting your search"
                  : "No vehicles in inventory"
              }
              icon={
                <svg
                  className="w-16 h-16 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
            />
          ) : (
            <Table>
              <Table.Header>
                <Table.HeaderCell>Vehicle</Table.HeaderCell>
                <Table.HeaderCell>Category</Table.HeaderCell>
                <Table.HeaderCell>Battery & Range</Table.HeaderCell>
                <Table.HeaderCell align="right">Base Price</Table.HeaderCell>
                <Table.HeaderCell align="center">
                  Current Stock
                </Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell align="center">Action</Table.HeaderCell>
              </Table.Header>
              <Table.Body>
                {filteredVehicles.map((vehicle) => (
                  <Table.Row key={vehicle.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <img
                          src={vehicle.imageUrl}
                          alt={vehicle.modelName}
                          className="w-16 h-16 rounded-lg object-cover bg-slate-700"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/150?text=No+Image";
                          }}
                        />
                        <div>
                          <p className="font-semibold text-white">
                            {vehicle.modelName}
                          </p>
                          <p className="text-sm text-slate-400">
                            {vehicle.version}
                          </p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-slate-300">{vehicle.category}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm">
                        <p className="text-slate-300">
                          {vehicle.batteryCapacity} kWh
                        </p>
                        <p className="text-slate-500">
                          {vehicle.rangePerCharge} km
                        </p>
                      </div>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <span className="font-semibold text-white">
                        {formatCurrency(vehicle.basePrice)}
                      </span>
                    </Table.Cell>
                    <Table.Cell align="center">
                      <Badge variant={getStockVariant(vehicle.currentStock)}>
                        {vehicle.currentStock} units
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        variant={
                          vehicle.status === "Available" ? "success" : "default"
                        }
                      >
                        {vehicle.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell align="center">
                      <Button
                        onClick={() => openAddStockModal(vehicle)}
                        variant="primary"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add Stock
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card>
      </div>

      {/* Add Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Add Stock to Inventory"
        size="md"
      >
        <form onSubmit={handleAddStock}>
          <Alert type={alert.type} message={alert.message} />

          {selectedVehicle && (
            <div className="space-y-4 mb-6">
              <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedVehicle.imageUrl}
                    alt={selectedVehicle.modelName}
                    className="w-16 h-16 rounded-lg object-cover bg-slate-600"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                  <div>
                    <p className="text-white font-semibold">
                      {selectedVehicle.modelName}
                    </p>
                    <p className="text-sm text-slate-400">
                      {selectedVehicle.version}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Current Stock</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedVehicle.currentStock} units
                  </p>
                </div>
              </div>

              <InputField
                id="quantity"
                name="quantity"
                type="number"
                label="Quantity to Add"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={1}
                required
                disabled={isSubmitting}
              />

              <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-3">
                <p className="text-blue-400 text-sm">
                  <strong>Note:</strong> Adding {quantity} unit(s) will increase
                  stock to {selectedVehicle.currentStock + quantity} units.
                </p>
              </div>
            </div>
          )}

          <Modal.Footer>
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Stock"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default EVMStaffInventoryPage;
