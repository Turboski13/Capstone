import React, { useState, useEffect } from 'react';

const DmUi = ({ teamId, assets, socket }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [visibilitySettings, setVisibilitySettings] = useState({});
  const [sharedAssets, setSharedAssets] = useState([]);


  const assetsByType = assets.reduce((acc, asset) => {
    const type = asset.Type || "Unknown";
    if (!acc[type]) acc[type] = [];
    acc[type].push(asset);
    return acc;
  }, {});

  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
    // Initialize visibility settings for the selected asset
    setVisibilitySettings((prev) => ({
      ...prev,
      [asset.id]: prev[asset.id] || {}, // Preserve existing settings if they exist
    }));
  };


  const handleToggleProperty = (property) => {
    setVisibilitySettings((prev) => ({
      ...prev,
      [selectedAsset.id]: {
        ...prev[selectedAsset.id],
        [property]: !prev[selectedAsset.id]?.[property], // Toggle the property visibility
      },
    }));
  };


  const handleAddToShared = () => {
    if (selectedAsset) {
      setSharedAssets((prev) => [...prev, selectedAsset]);
      const visibleProperties = Object.keys(
        visibilitySettings[selectedAsset.id] || {}
      ).filter((key) => visibilitySettings[selectedAsset.id][key]);

      // Emit shared asset data to the server
      socket.emit("addSharedAsset", {
        teamId,
        assetId: selectedAsset.id,
        visibleProperties,
      });
    }
  };

  return(
      <>
       <div className="dm-ui">
      <div className="tabs">
        {Object.keys(assetsByType).map((type) => (
          <button
            key={type}
            className={activeTab === type ? "active" : ""}
            onClick={() => setActiveTab(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {activeTab && (
        <div className="tab-content">
          <h3>{activeTab} Assets</h3>
          <div className="asset-grid">
            {assetsByType[activeTab].map((asset) => (
              <div
                key={asset.id}
                className={`asset-card ${
                  selectedAsset?.id === asset.id ? "selected" : ""
                }`}
                onClick={() => handleSelectAsset(asset)}
              >
                <h4>{asset.Name || "Unnamed Asset"}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedAsset && (
        <div className="asset-details">
          <h3>{selectedAsset.Name || "Unnamed Asset"} Details</h3>
          <div className="property-list">
            {Object.keys(selectedAsset).map((property) => (
              <label key={property}>
                <input
                  type="checkbox"
                  checked={
                    visibilitySettings[selectedAsset.id]?.[property] || false
                  }
                  onChange={() => handleToggleProperty(property)}
                />
                {property}
              </label>
            ))}
          </div>
          <button onClick={handleAddToShared}>Add to Shared Assets</button>
        </div>
      )}
    </div>
    </>
  )
}
export default DmUi;